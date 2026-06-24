import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { SequelizeModule } from '@nestjs/sequelize';

import { Room } from './entities/room.entity';
import { RoomUser } from './entities/room-user.entity';
import { User } from '../users/entities/user.entity';

import { Game } from '../games/entities/game.entity';
import { Player } from '../players/entities/player.entity';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService],
  imports: [SequelizeModule.forFeature([Room, User, RoomUser, Game, Player])],
})
export class RoomsModule {}
