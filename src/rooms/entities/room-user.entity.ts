import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';

import { User } from 'src/users/entities/user.entity';
import { Room } from './room.entity';

@Table({ tableName: 'room_users', timestamps: false })
export class RoomUser extends Model {
  @ForeignKey(() => User)
  @PrimaryKey
  @Column({ field: 'user_id', type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @ForeignKey(() => Room)
  @PrimaryKey
  @Column({ field: 'room_id', type: DataType.INTEGER, allowNull: false })
  declare roomId: number;
}
