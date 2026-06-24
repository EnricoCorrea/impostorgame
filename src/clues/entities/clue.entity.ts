import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { Game } from 'src/games/entities/game.entity';
import { Player } from 'src/players/entities/player.entity';

@Table({
  tableName: 'clues',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class Clue extends Model {
  @ForeignKey(() => Game)
  @Column({
    field: 'game_id',
  })
  declare gameId: number;

  @ForeignKey(() => Player)
  @Column({
    field: 'player_id',
  })
  declare playerId: number;

  @Column({ field: 'round_number' })
  declare roundNumber: number;

  @Column
  declare clue: string;

  @BelongsTo(() => Game)
  declare games: Game;

  @BelongsTo(() => Player)
  declare players: Player;
}
