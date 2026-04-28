import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Word } from './entities/word.entity';
import { paginate } from '../common/enums/utils/paginate';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import { Op } from 'sequelize';
import { WordFilterDto } from './dto/words-filter.dto';

@Injectable()
export class WordsService {
  constructor(
    @InjectModel(Word)
    private wordModel: typeof Word,
  ) { }

  async create(createWordDto: CreateWordDto) {
    return this.wordModel.create({ ...createWordDto });
  }

  async findAll(pagination: PaginationDto, filters: WordFilterDto) {
    const where = {
      ...(filters.word && {
        word: { [Op.iLike]: `%${filters.word}%` },
      }),
      ...(filters.impostorClue && {
        impostorClue: {
          [Op.iLike]: `%${filters.impostorClue}%`,
        },
      }),
    };

    return paginate(this.wordModel, pagination, { where });
  }

  async findOne(id: number) {
    const word = await this.wordModel.findByPk(id);

    if (!word) {
      throw new NotFoundException('Word not found');
    }

    return word;
  }

  async update(id: number, updateWordDto: UpdateWordDto) {
    const word = await this.wordModel.findByPk(id);

    if (!word) {
      throw new NotFoundException('Word not found');
    }

    await word.update({ ...updateWordDto });

    return word;
  }

  async remove(id: number) {
    const word = await this.wordModel.findByPk(id);

    if (!word) {
      throw new NotFoundException('Word not found');
    }

    await word.destroy();

    return word;
  }
}
