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
import { GamesGateway } from './games/games.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RoomsModule,
    UsersModule,
    GamesModule,
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useSsl = config.get<string>('DB_SSL', 'false') === 'true';

        return {
          dialect: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USER', 'postgres'),
          password: config.get<string>('DB_PASSWORD', 'postgres'),
          database: config.get<string>('DB_NAME', 'impostor_game'),
          autoLoadModels: true,
          synchronize: config.get<string>('DB_SYNC', 'false') === 'true',
          define: { timestamps: false },
          logging: console.log,
          ...(useSsl
            ? {
                dialectOptions: {
                  ssl: {
                    require: true,
                    rejectUnauthorized: false,
                  },
                },
              }
            : {}),
        };
      },
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
