import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
} from 'sequelize-typescript';

import { User } from 'src/users/entities/user.entity';
import { Game } from 'src/games/entities/game.entity';

@Table({
  tableName: 'rooms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class Room extends Model {
  @Column
  name: string;

  @ForeignKey(() => User)
  @Column({ field: 'host_id' })
  hostId: number;

  @BelongsTo(() => User)
  host: User;

  @Column({
    type: DataType.ENUM('WAITING', 'PLAYING', 'CLOSED'),
  })
  status: string;

  @Column({ field: 'max_users' })
  maxUsers: number;

  @Column({ field: 'closed_at' })
  closedAt: Date;
  
  @HasMany(() => Game)
  games: Game[];
}