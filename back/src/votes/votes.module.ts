import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { Game } from 'src/games/entities/game.entity';
import { Player } from 'src/players/entities/player.entity';
import { Vote } from './entities/vote.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  controllers: [VotesController],
  providers: [VotesService],
  imports: [SequelizeModule.forFeature([Vote, Player, Game])],
})
export class VotesModule {}
