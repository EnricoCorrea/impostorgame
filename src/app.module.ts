import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module'; 
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [RoomsModule, UsersModule, GamesModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'amigo',
      password: 'Cefet123!',
      database: 'impostorgame',

      autoLoadModels: true,
      synchronize: false,

      logging: true,
    }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
