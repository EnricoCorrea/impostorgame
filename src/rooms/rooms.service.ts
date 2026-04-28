import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { Room } from './entities/room.entity';
import { RoomUser } from './entities/room-user.entity';
import { User } from '../users/entities/user.entity';
import { paginate } from '../common/enums/utils/paginate';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import { Game } from '../games/entities/game.entity';
import { Player } from '../players/entities/player.entity';

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
  ) {}

  async create(data: any) {
    const maxUsers = data.maxPlayers ?? data.maxUsers;

    if (maxUsers == null) {
      throw new BadRequestException('maxPlayers is required');
    }

    if (maxUsers > 5) {
      throw new BadRequestException('A sala pode ter no máximo 5 usuários');
    }

    return this.roomModel.create({
      ...data,
      maxUsers,
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

    // RN008 - jogo em andamento
    const activeGame = await this.gameModel.findOne({
      where: {
        roomId,
        finishedAt: null,
      },
      order: [['createdAt', 'DESC']],
    });

    if (
      activeGame &&
      activeGame.status !== 'WAITING'
    ) {
      throw new BadRequestException(
        'Cannot join room while a game is in progress'
      );
    }

    const currentUsers =
      await this.roomUserModel.count({
        where: { roomId },
      });

    if (currentUsers >= room.maxUsers) {
      throw new BadRequestException(
        'Room is full'
      );
    }

    try {
      const [roomUser, created] =
        await this.roomUserModel.findOrCreate({
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

  async findAll(pagination: PaginationDto) {
    return paginate(this.roomModel, pagination, {
      include: [
        { model: User, as: 'host' },
        { model: User, as: 'users' },
      ],
    });
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

    if (!room) throw new NotFoundException('Room not found');
    return room;
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

  async remove(id: number) {
    const room = await this.roomModel.findByPk(id);
    if (!room) throw new NotFoundException('Room not found');
    await room.destroy();
    return room;
  }

async leaveRoom(roomId: number, userId: number) {
  const activeGame = await this.gameModel.findOne({
    where: {
      roomId,
      finishedAt: null,
    },
    order: [['createdAt', 'DESC']],
  });

  // se existe partida em andamento → elimina jogador
  if (
    activeGame &&
    activeGame.status !== 'WAITING'
  ) {
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

  return {
    success: deleted > 0,
    message:
      activeGame &&
      activeGame.status !== 'WAITING'
        ? 'Player disconnected and was eliminated from the match'
        : 'User left room successfully',
  };
}
}
