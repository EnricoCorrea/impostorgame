import { Column, Model, Table } from 'sequelize-typescript';
import { HasMany, BelongsToMany } from 'sequelize-typescript';
import { Room } from 'src/rooms/entities/room.entity';
import { Player } from 'src/players/entities/player.entity'


@Table({
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class User extends Model {
  @Column
  name: string;

  @Column
  email: string;

  @Column
  password: string;

  @HasMany(() => Room)
  rooms: Room[];

  @HasMany(() => Player)
  players: Player;
}