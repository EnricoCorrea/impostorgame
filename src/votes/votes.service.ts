import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vote } from './entities/vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';
import { Game } from 'src/games/entities/game.entity';
import { Player } from 'src/players/entities/player.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectModel(Vote)
    private voteModel: typeof Vote,
  ) {}

  async create(createVoteDto: CreateVoteDto) {
    return this.voteModel.create(createVoteDto as any);
  }

  async findAll() {
  return this.voteModel.findAll({
    include: [
      {
        model: Game,
      },
      {
        model: Player,
        as: 'voter',
      },
      {
        model: Player,
        as: 'target',
      },
    ],
  });
}

  async findOne(
    roundNumber: number,
    gameId: number,
    voterId: number,
  ) {
    const vote = await this.voteModel.findOne({
      where: {
        roundNumber,
        gameId,
        voterId,
      },
      include: [
        {
          model: Game,
        },
        {
          model: Player,
          as: 'voter',
        },
        {
          model: Player,
          as: 'target',
        },
      ]
    });
    if (!vote) {
      throw new NotFoundException('Vote not found');
    }
    return vote;
  }

  async update(
    roundNumber: number,
    gameId: number,
    voterId: number,
    updateVoteDto: UpdateVoteDto,
  ) {
    const vote = await this.findOne(roundNumber, gameId, voterId);

    await vote.update(updateVoteDto);

    return vote;
  }

  async remove(
    roundNumber: number,
    gameId: number,
    voterId: number,
  ) {
    const vote = await this.findOne(roundNumber, gameId, voterId);

    await vote.destroy();

    return {
      message: 'Vote removed successfully',
    };
  }
}