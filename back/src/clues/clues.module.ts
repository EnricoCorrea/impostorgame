import { Module } from '@nestjs/common';
import { CluesService } from './clues.service';
import { CluesController } from './clues.controller';
import { Clue } from './entities/clue.entity';
import { Game } from 'src/games/entities/game.entity';
import { Player } from 'src/players/entities/player.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { Word } from 'src/words/entities/word.entity';

@Module({
  controllers: [CluesController],
  providers: [CluesService],
  imports: [SequelizeModule.forFeature([Clue, Game, Player, Word])],
})
export class CluesModule {}
