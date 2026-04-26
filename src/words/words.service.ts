import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Word } from './entities/word.entity';

@Injectable()
export class WordsService {
  constructor(
    @InjectModel(Word)
    private wordModel: typeof Word,
  ) {}

  async create(createWordDto: CreateWordDto) {
    return this.wordModel.create({ ...createWordDto });
  }

  async findAll() {
    return this.wordModel.findAll();
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
