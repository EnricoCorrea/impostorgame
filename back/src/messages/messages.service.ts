import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
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
  ) {}

  async create(data: any) {
    return await this.messageModel.create({
      ...data,
      status: 'WAITING',
    });
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
