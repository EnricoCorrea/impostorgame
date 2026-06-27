import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op, UniqueConstraintError } from 'sequelize';
import { Room } from './entities/room.entity';
import { RoomUser } from './entities/room-user.entity';
import { User } from '../users/entities/user.entity';
import { paginate } from '../common/enums/utils/paginate';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import { Game } from '../games/entities/game.entity';
import { Player } from '../players/entities/player.entity';
import { RoomFilterDto } from './dto/rooms-filter.dto';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room)
    private roomModel: typeof Room,

    @InjectModel(RoomUser)
    private roomUserModel: typeof RoomUser,

    @InjectModel(Game)
    private gameModel: typeof Game,

    @InjectModel(Player)
    private playerModel: typeof Player,

    @InjectConnection()
    private sequelize: Sequelize,
  ) {}

  async create(data: CreateRoomDto, hostId: number) {
    return this.sequelize.transaction(async (transaction) => {
      const room = await this.roomModel.create(
        { ...data, hostId, status: 'WAITING' },
        { transaction },
      );

      await this.roomUserModel.create(
        { roomId: room.id, userId: hostId },
        { transaction },
      );
      return room;
    });
  }

  async joinRoom(roomId: number, userId: number) {
    if (!roomId || !userId) {
      throw new BadRequestException('roomId or userId missing');
    }

    const room = await this.roomModel.findByPk(roomId);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status === 'CLOSED') {
      throw new BadRequestException('Sala excluida.');
    }

    const existingUser = await this.roomUserModel.findOne({
      where: { roomId, userId },
    });

    if (existingUser) {
      return {
        message: 'Already in room',
      };
    }

    // RN008 - jogo em andamento
    const activeGame = await this.gameModel.findOne({
      where: {
        roomId,
        finishedAt: null,
      },
      order: [['startedAt', 'DESC']],
    });

    if (activeGame && activeGame.status !== 'WAITING') {
      throw new BadRequestException(
        'A partida ja comecou. Aguarde terminar para entrar na sala.',
      );
    }

    const currentUsers = await this.roomUserModel.count({
      where: { roomId },
    });

    if (currentUsers >= room.maxUsers) {
      throw new BadRequestException('Room is full');
    }

    try {
      const [roomUser, created] = await this.roomUserModel.findOrCreate({
        where: { roomId, userId },
        defaults: { roomId, userId },
      });

      if (!created) {
        return {
          message: 'Already in room',
        };
      }

      return roomUser;
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        return {
          message: 'Already in room',
        };
      }

      throw err;
    }
  }

  async findAll(pagination: PaginationDto, filters: RoomFilterDto) {
    const where = {
      status: { [Op.ne]: 'CLOSED' },
      ...(filters.name && {
        name: {
          [Op.iLike]: `%${filters.name}%`, // busca parcial
        },
      }),
      ...(filters.host_id && {
        hostId: filters.host_id,
      }),
    };

    const result = await paginate(this.roomModel, pagination, {
      where,
      distinct: true,
    });

    await this.applyEffectiveRoomStatus(result.data);

    return result;
  }

  async getRoomUsers(roomId: number) {
    const room = await this.roomModel.findByPk(roomId, {
      include: [{ model: User, as: 'users' }],
    });

    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async findOne(id: number) {
    const room = await this.roomModel.findByPk(id, {
      include: [
        { model: User, as: 'host' },
        { model: User, as: 'users' },
      ],
    });

    if (!room || room.status === 'CLOSED') throw new NotFoundException('Room not found');
    await this.applyEffectiveRoomStatus([room]);
    return room;
  }

  private async applyEffectiveRoomStatus(rooms: Room[]) {
    const openRooms = rooms.filter((room) => room.status !== 'CLOSED');
    const roomIds = openRooms.map((room) => room.id);

    if (roomIds.length === 0) return;

    const activeGames = await this.gameModel.findAll({
      where: {
        roomId: { [Op.in]: roomIds },
        finishedAt: null,
      },
      order: [['startedAt', 'DESC']],
    });

    const gamesByRoom = new Map<number, Game>();
    for (const game of activeGames) {
      if (!gamesByRoom.has(game.roomId)) {
        gamesByRoom.set(game.roomId, game);
      }
    }

    for (const room of openRooms) {
      const activeGame = gamesByRoom.get(room.id);
      room.setDataValue(
        'status',
        activeGame && activeGame.status !== 'WAITING' ? 'PLAYING' : 'WAITING',
      );
    }
  }
  async update(id: number, data: any) {
    const room = await this.roomModel.findByPk(id);
    if (!room) throw new NotFoundException('Room not found');

    if (data.maxPlayers != null) {
      if (data.maxPlayers > 5) {
        throw new BadRequestException('A sala pode ter no máximo 5 usuários');
      }
      data.maxUsers = data.maxPlayers;
    }

    await room.update(data);
    return room;
  }

  async remove(id: number, requestingUserId: number, role?: string) {
    const room = await this.roomModel.findByPk(id);
    if (!room) throw new NotFoundException('Room not found');

    this.assertHost(room, requestingUserId, role);

    await this.roomUserModel.destroy({ where: { roomId: id } });
    await room.update({ status: 'CLOSED', closedAt: new Date() });
    return room;
  }

  async kickUser(roomId: number, targetUserId: number, requestingUserId: number) {
    const room = await this.roomModel.findByPk(roomId);
    if (!room) throw new NotFoundException('Room not found');

    this.assertHost(room, requestingUserId);

    if (targetUserId === room.hostId) {
      throw new BadRequestException('O anfitriao nao pode ser expulso da sala.');
    }

    return this.leaveRoom(roomId, targetUserId);
  }

  private assertHost(room: Room, requestingUserId: number, role?: string) {
    if (role === 'ADMIN' || room.hostId === requestingUserId) return;

    throw new ForbiddenException('Somente o anfitriao pode executar esta acao.');
  }

  private async reconcileRoomAfterUserLeaves(roomId: number, userId: number) {
    const room = await this.roomModel.findByPk(roomId);
    if (!room || room.status === 'CLOSED') return;

    const remainingUsers = await this.roomUserModel.findAll({
      where: { roomId },
      order: [['userId', 'ASC']],
    });

    if (remainingUsers.length === 0) {
      await room.update({ status: 'CLOSED', closedAt: new Date() });
      return;
    }

    if (room.hostId === userId) {
      await room.update({ hostId: remainingUsers[0].userId });
    }
  }

  async leaveRoom(roomId: number, userId: number) {
    const activeGame = await this.gameModel.findOne({
      where: {
        roomId,
        finishedAt: null,
      },
      order: [['startedAt', 'DESC']],
    });

    if (activeGame?.status === 'WAITING') {
      await this.playerModel.destroy({
        where: {
          gameId: activeGame.id,
          userId,
        },
      });
    }

    // se existe partida em andamento -> elimina jogador
    if (activeGame && activeGame.status !== 'WAITING') {
      const player = await this.playerModel.findOne({
        where: {
          gameId: activeGame.id,
          userId,
        },
      });

      if (player) {
        player.isAlive = false;
        await player.save();
      }
    }
    const deleted = await this.roomUserModel.destroy({
      where: { roomId, userId },
    });

    if (deleted > 0) {
      await this.reconcileRoomAfterUserLeaves(roomId, userId);
    }

    return {
      success: deleted > 0,
      message:
        activeGame && activeGame.status !== 'WAITING'
          ? 'Player disconnected and was eliminated from the match'
          : 'User left room successfully',
    };
  }
}
