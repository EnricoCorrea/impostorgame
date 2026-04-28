import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateClueDto } from './dto/create-clue.dto';
import { UpdateClueDto } from './dto/update-clue.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Clue } from './entities/clue.entity';
import { Game } from 'src/games/entities/game.entity';
import { Player } from 'src/players/entities/player.entity';
import { Word } from 'src/words/entities/word.entity';
import { paginate } from '../common/enums/utils/paginate';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';

@Injectable()
export class CluesService {
  constructor(
    @InjectModel(Clue)
    private clueModel: typeof Clue,
    @InjectModel(Player)
    private playerModel: typeof Player,
  ) { }


  async create(data: any) {
    const player = await this.playerModel.findByPk(data.playerId, {
      include: [Word],
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    if (!player.isAlive) {
      throw new BadRequestException(
        'Dead players cannot send clues',
      );
    }

    // impede múltiplas dicas na mesma rodada
    const existingClue = await this.clueModel.findOne({
      where: {
        gameId: data.gameId,
        playerId: data.playerId,
        roundNumber: data.roundNumber,
      },
    });

    if (existingClue) {
      throw new BadRequestException(
        'Player already submitted a clue this round',
      );
    }

    // RN005
    if (
      player.role !== 'IMPOSTOR' &&
      player.word?.word &&
      containsSecretWord(
        data.clue,
        player.word.word,
      )
    ) {
      throw new BadRequestException(
        'Innocent players cannot use the secret word in clues',
      );
    }

    return await this.clueModel.create({
      ...data,
      status: 'WAITING',
    });
  }

  async findAll(pagination: PaginationDto) {
    return paginate(this.clueModel, pagination, {
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

  async update(id: number, data: UpdateClueDto) {
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

function containsSecretWord(clue: string, secretWord: string) {
  const escaped = secretWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(clue);
}
