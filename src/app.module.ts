import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module'; 
import { SequelizeModule } from '@nestjs/sequelize';
import { MessagesModule } from './messages/messages.module';
import { VotesModule } from './votes/votes.module';
import { PlayersModule } from './players/players.module';
import { WordsModule } from './words/words.module';
import { CluesModule } from './clues/clues.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [RoomsModule, UsersModule, GamesModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: '26.154.169.75',
      port: 5432,
      username: 'amigo',
      password: 'Cefet123!',
      database: 'impostor_game',

      autoLoadModels: true,
      synchronize: false,
      define: {
        timestamps: false,
      },
      logging: true,
    }),
    MessagesModule,
    VotesModule,
    PlayersModule,
    WordsModule,
    CluesModule,
    AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
