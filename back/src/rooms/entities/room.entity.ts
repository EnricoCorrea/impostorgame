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
  declare name: string;

  @ForeignKey(() => User)
  @Column({ field: 'host_id', allowNull: false })
  declare hostId: number;

  @BelongsTo(() => User, 'hostId')
  declare host: User;

  @Column({
    type: DataType.ENUM('WAITING', 'PLAYING', 'CLOSED'),
    allowNull: false,
    defaultValue: 'WAITING',
  })
  declare status: string;

  @Column({ field: 'max_users', allowNull: false })
  declare maxUsers: number;

  @Column({ field: 'closed_at', type: DataType.DATE, allowNull: true })
  declare closedAt: Date | null;

  @HasMany(() => Game)
  declare games: Game[];

  @BelongsToMany(() => User, () => RoomUser)
  declare users: User[];
}
