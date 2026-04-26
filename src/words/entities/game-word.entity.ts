import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript'
import { Game } from 'src/games/entities/game.entity';
import { Word } from './word.entity';

@Table({
    tableName: 'words',
    timestamps: false,
})

export class GameWord extends Model {
    @ForeignKey(() => Game)
    @Column({ field: 'game_id'})
    gameId: number;

    @ForeignKey(() => Word)
    @Column({ field: 'word_id'})
    wordId: number;
}
