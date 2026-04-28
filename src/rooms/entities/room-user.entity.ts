import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';

import { User } from 'src/users/entities/user.entity';
import { Room } from './room.entity';

@Table({ tableName: 'room_users', timestamps: false })
export class RoomUser extends Model {
  @ForeignKey(() => User)
  @Column({ field: 'user_id', type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @ForeignKey(() => Room)
  @Column({ field: 'room_id', type: DataType.INTEGER, allowNull: false })
  roomId!: number;
}
