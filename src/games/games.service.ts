import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Game } from './entities/game.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game)
    private gameModel: typeof Game,
  ) {}

  async create(data: any) {
    return await this.gameModel.create({
      ...data,
      status: 'WAITING',
    });
  }

  async findAll() {
    return await this.gameModel.findAll({
      include: [Room],
    });
  }

  async findOne(id: number) {
    const game = await this.gameModel.findByPk(id, {
      include: [Room],
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async update(id: number, data: any) {
    const game = await this.gameModel.findByPk(id);

      if (!game) {
        throw new NotFoundException('Game not found');
      }

      await game.update(data);

      return game;
  }

  async remove(id: number) {
    const game = await this.gameModel.findByPk(id);

    if (!game) {
    throw new NotFoundException('Game not found');
    }

    await game.destroy();

    return game;
  }
}
