import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { GamesGateway } from './games.gateway';

import { Game } from './entities/game.entity';
import { Player } from 'src/players/entities/player.entity';
import { Vote } from 'src/votes/entities/vote.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { Word } from 'src/words/entities/word.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Game,
      Player,
      Vote,
      Room,
      Word,
    ]),
  ],
  controllers: [GamesController],
  providers: [GamesService, GamesGateway],
})
export class GamesModule {}