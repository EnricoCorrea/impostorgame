import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { GamesService } from './games.service';
import { GamesController } from './games.controller';

import { Game } from './entities/game.entity';
import { Player } from 'src/players/entities/player.entity';
import { Vote } from 'src/votes/entities/vote.entity';
import { Room } from 'src/rooms/entities/room.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Game,
      Player,
      Vote,
      Room,
    ]),
  ],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}