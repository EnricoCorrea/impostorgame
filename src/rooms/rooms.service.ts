import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { Room } from './entities/room.entity';
import { RoomUser } from './entities/room-user.entity';
import { User } from '../users/entities/user.entity';
import { paginate } from '../common/enums/utils/paginate';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room)
    private roomModel: typeof Room,

    @InjectModel(RoomUser)
    private roomUserModel: typeof RoomUser,
  ) {}

  async create(data: any) {
    return this.roomModel.create(data);
  }

  async joinRoom(roomId: number, userId: number) {
    if (!roomId || !userId) {
      throw new BadRequestException('roomId or userId missing');
    }

    const room = await this.roomModel.findByPk(roomId);
    if (!room) throw new NotFoundException('Room not found');

    const currentUsers = await this.roomUserModel.count({ where: { roomId } });
    if (currentUsers >= room.maxUsers) {
      throw new BadRequestException('Room is full');
    }

    try {
      const [roomUser, created] = await this.roomUserModel.findOrCreate({
        where: { roomId, userId },
        defaults: { roomId, userId },
      });

      if (!created) {
        return { message: 'Already in room' };
      }

      return roomUser;
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        return { message: 'Already in room' };
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
    const deleted = await this.roomUserModel.destroy({
      where: { roomId, userId },
    });

    return { success: deleted > 0 };
  }
}
