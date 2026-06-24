import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from 'sequelize-typescript';
import { Game } from 'src/games/entities/game.entity';
import { Word } from './word.entity';

@Table({
  tableName: 'game_words',
  timestamps: false,
})
export class GameWord extends Model {
  @ForeignKey(() => Game)
  @PrimaryKey
  @Column({ field: 'game_id' })
  declare gameId: number;

  @ForeignKey(() => Word)
  @Column({ field: 'word_id' })
  declare wordId: number;
}
