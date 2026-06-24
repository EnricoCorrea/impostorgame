import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vote } from './entities/vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';
import { Game } from 'src/games/entities/game.entity';
import { Player } from 'src/players/entities/player.entity';
import { paginate } from '../common/enums/utils/paginate';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import { VoteFilterDto } from './dto/votes-filter.dto';

@Injectable()
export class VotesService {
  constructor(
    @InjectModel(Vote)
    private voteModel: typeof Vote,
    @InjectModel(Player)
    private playerModel: typeof Player,
  ) {}

  async create(createVoteDto: CreateVoteDto) {
    return this.voteModel.create(createVoteDto as any);
  }

  async findAll(pagination: PaginationDto, filters: VoteFilterDto) {
    const where = {
      ...(filters.game_id && { gameId: filters.game_id }),
      ...(filters.voter_id && { voterId: filters.voter_id }),
      ...(filters.target_player_id && {
        targetPlayerId: filters.target_player_id,
      }),
    };

    return paginate(this.voteModel, pagination, {
      where,
      distinct: true,
      include: [
        { model: Game },
        { model: Player, as: 'voter' },
        { model: Player, as: 'target' },
      ],
    });
  }

  async findOne(roundNumber: number, gameId: number, voterId: number) {
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
      ],
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

  async remove(roundNumber: number, gameId: number, voterId: number) {
    const vote = await this.findOne(roundNumber, gameId, voterId);

    await vote.destroy();

    return {
      message: 'Vote removed successfully',
    };
  }
}
