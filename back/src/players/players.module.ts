import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { Player } from './entities/player.entity';
import { Word } from 'src/words/entities/word.entity';
import { User } from 'src/users/entities/user.entity';
import { Game } from 'src/games/entities/game.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  controllers: [PlayersController],
  providers: [PlayersService],
  imports: [SequelizeModule.forFeature([Player, Game, User, Word])],
})
export class PlayersModule {}
