import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Player } from './entities/player.entity';
import { Game } from 'src/games/entities/game.entity';
import { User } from 'src/users/entities/user.entity';
import { Word } from 'src/words/entities/word.entity';

@Injectable()
export class PlayersService {
constructor(
  @InjectModel(Player)
  private playerModel: typeof Player,
) {}

async create(createPlayerDto: CreatePlayerDto) {
  return this.playerModel.create({ ...createPlayerDto });
}

async findAll() {
  return this.playerModel.findAll({
    include: [Game, User, Word]
  });
}

async findOne(id: number) {
  const player = await this.playerModel.findByPk(id);

  if (!player) {
    throw new NotFoundException('Player not found');
  }

  return player;
}

async update(id: number, updatePlayerDto: UpdatePlayerDto) {
  const player = await this.playerModel.findByPk(id);

  if (!player) {
    throw new NotFoundException('Player not found');
  }

  await player.update({ ...updatePlayerDto });

  return player;
}

async remove(id: number) {
  const player = await this.playerModel.findByPk(id, {
    include: [Game, User, Word]
  });

  if (!player) {
    throw new NotFoundException('Player not found');
  }

  await player.destroy();

  return player;
}
}
