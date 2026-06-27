import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { Game } from 'src/games/entities/game.entity';
import { Player } from 'src/players/entities/player.entity';
import { paginate } from '../common/enums/utils/paginate';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import { MessageFilterDto } from './dto/message-filter.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message)
    private messageModel: typeof Message,
    @InjectModel(Game)
    private gameModel: typeof Game,
    @InjectModel(Player)
    private playerModel: typeof Player,
  ) {}

  async create(data: any) {
    const game = await this.gameModel.findByPk(data.gameId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status !== 'DISCUSSING') {
      throw new BadRequestException('O chat so fica aberto na fase de discussao');
    }

    const player = await this.playerModel.findByPk(data.playerId);

    if (!player || player.gameId !== data.gameId) {
      throw new NotFoundException('Player not found');
    }

    if (!player.isAlive) {
      throw new BadRequestException('Dead players cannot send messages');
    }

    return await this.messageModel.create(data);
  }

  async findAll(pagination: PaginationDto, filters: MessageFilterDto) {
    const where = {
      ...(filters.game_id && { gameId: filters.game_id }),
      ...(filters.player_id && { playerId: filters.player_id }),
    };

    return paginate(this.messageModel, pagination, {
      where,
      distinct: true,
      include: [{ model: Game }, { model: Player }],
    });
  }

  async findOne(id: number) {
    const message = await this.messageModel.findByPk(id, {
      include: [Game, Player],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async update(id: number, data: any) {
    const message = await this.messageModel.findByPk(id);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await message.update(data);

    return message;
  }

  async remove(id: number) {
    const message = await this.messageModel.findByPk(id);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await message.destroy();

    return message;
  }
}
