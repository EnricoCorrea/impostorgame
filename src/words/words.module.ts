import { Module } from '@nestjs/common';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Word } from './entities/word.entity'; 

@Module({
  controllers: [WordsController],
  providers: [WordsService],
  imports: [SequelizeModule.forFeature([Word])],
})
export class WordsModule {}
