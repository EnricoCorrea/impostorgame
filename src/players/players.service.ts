import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Player } from './entities/player.entity';
import { Game } from 'src/games/entities/game.entity';
import { User } from 'src/users/entities/user.entity';
import { Word } from 'src/words/entities/word.entity';
import { paginate } from '../common/enums/utils/paginate';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import { PlayerRole } from 'src/common/enums/player-role';

@Injectable()
export class PlayersService {
constructor(
  @InjectModel(Player)
  private playerModel: typeof Player,
) {}

async create(createPlayerDto: CreatePlayerDto) {
  const role = createPlayerDto.role
    ? createPlayerDto.role
    : createPlayerDto.isImpostor
    ? PlayerRole.IMPOSTOR
    : PlayerRole.INNOCENT;

  if (role === PlayerRole.IMPOSTOR) {
    await this.ensureSingleImpostor(createPlayerDto.gameId);
  }

  return this.playerModel.create({
    ...createPlayerDto,
    role,
  });
}

async findAll(pagination: PaginationDto) {
  return paginate(this.playerModel, pagination, {
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

  const gameId = updatePlayerDto.gameId ?? player.gameId;
  const role = updatePlayerDto.role
    ? updatePlayerDto.role
    : updatePlayerDto.isImpostor
    ? PlayerRole.IMPOSTOR
    : player.role;

  if (role === PlayerRole.IMPOSTOR) {
    await this.ensureSingleImpostor(gameId, id);
  }

  await player.update({ ...updatePlayerDto, role, gameId });

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

private async ensureSingleImpostor(gameId: number, currentPlayerId?: number) {
  const existingImpostor = await this.playerModel.findOne({
    where: {
      gameId,
      role: PlayerRole.IMPOSTOR,
    },
  });

  if (existingImpostor && existingImpostor.id !== currentPlayerId) {
    throw new BadRequestException('Já existe um impostor neste jogo.');
  }
}
}
