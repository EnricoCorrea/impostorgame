import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { VotesModule } from './votes/votes.module';

@Module({
  imports: [GamesModule, VotesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
