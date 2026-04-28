import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Room } from './entities/room.entity';
import { User } from '../users/entities/user.entity';
import { RoomUser } from './entities/room-user.entity';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService],
  imports: [SequelizeModule.forFeature([Room, User, RoomUser])],
})
export class RoomsModule {}
