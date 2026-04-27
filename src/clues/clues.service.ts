import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClueDto } from './dto/create-clue.dto';
import { UpdateClueDto } from './dto/update-clue.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Clue } from './entities/clue.entity';
import { Game } from 'src/games/entities/game.entity';
import { Player } from 'src/players/entities/player.entity';

@Injectable()
export class CluesService {
  constructor(
    @InjectModel(Clue)
    private clueModel: typeof Clue,
  ) {}

  async create(data: any) {
    return await this.clueModel.create({
      ...data,
      status: 'WAITING',
    });
  }

  async findAll() {
    return await this.clueModel.findAll({
      include: [Game, Player],
    });
  }

  async findOne(id: number) {
    const clue = await this.clueModel.findByPk(id, {
      include: [Game, Player],
    });

    if (!clue) {
      throw new NotFoundException('Clue not found');
    }

    return clue;
  }

  async update(id: number, data: any) {
    const clue = await this.clueModel.findByPk(id);

      if (!clue) {
        throw new NotFoundException('Clue not found');
      }

      await clue.update(data);

      return clue;
  }

  async remove(id: number) {
    const clue = await this.clueModel.findByPk(id);

    if (!clue) {
    throw new NotFoundException('Clue not found');
    }

    await clue.destroy();

    return clue;
  }
}
