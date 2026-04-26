import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Room } from './entities/room.entity';
import { NotFoundException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';


@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room)
    private roomModel: typeof Room,
  ) {}

  async create(data: any) {
    return this.roomModel.create({
      ...data,
      //status: 'WAITING',
    });
  }

  async findAll() {
    return this.roomModel.findAll({
      include: [User],
    });
  }

  async findOne(id: number) {
    const room = await this.roomModel.findByPk(id, {
      include: [User],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(id: number, data: any) {
    const room = await this.roomModel.findByPk(id);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    await room.update(data);

    return room;
  }

  async remove(id: number) {
    const room = await this.roomModel.findByPk(id);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    await room.destroy();

    return room;
  }
}