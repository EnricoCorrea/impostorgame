import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { VotesModule } from './votes/votes.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [GamesModule, VotesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
