import { Column, Model, Table } from 'sequelize-typescript';
import { HasMany, BelongsToMany } from 'sequelize-typescript';
import { Room } from 'src/rooms/entities/room.entity';
import { Player } from 'src/players/entities/player.entity'
import { RoomUser } from 'src/rooms/entities/room-user.entity';


@Table({
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class User extends Model {
  @Column
  declare name: string;

  @Column
  declare email: string;

  @Column
  declare password: string;
  
  @Column({
    defaultValue: 'PLAYER'
  })
  declare role: string;

  @BelongsToMany(() => Room, () => RoomUser, 'user_id', 'room_id')
  rooms: Room[];

  @HasMany(() => Player)
  players: Player[];
}