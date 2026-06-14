import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';

import { User } from 'src/users/entities/user.entity';
import { Game } from 'src/games/entities/game.entity';
import { RoomUser } from './room-user.entity';

@Table({
  tableName: 'rooms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class Room extends Model {
  @Column
  name!: string;

  @ForeignKey(() => User)
  @Column({ field: 'host_id', allowNull: false })
  hostId!: number;

  @Column({ type: DataType.ENUM('WAITING','PLAYING','CLOSED'), allowNull: false })
  status!: string;

  @Column({ field: 'max_users', allowNull: false })
  maxUsers!: number;

  @Column({ field: 'closed_at' })
  closedAt!: Date;

  @HasMany(() => Game)
  declare games: Game[];

  @BelongsToMany(() => User, () => RoomUser)
  declare users: User[];
}