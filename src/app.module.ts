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
import { GamesGateway } from './games/games.gateway'

@Module({
  imports: [
    RoomsModule,
    UsersModule,
    GamesModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST ?? '26.154.169.75',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER ?? 'amigo',
      password: process.env.DB_PASS ?? 'Cefet123!',
      database: process.env.DB_NAME ?? 'impostor_game',
      autoLoadModels: true,
      synchronize: process.env.DB_SYNC === 'true',
      define: {
        timestamps: false,
      },
      logging: false,
    }),
    MessagesModule,
    VotesModule,
    PlayersModule,
    WordsModule,
    CluesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}