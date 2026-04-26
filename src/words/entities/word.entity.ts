import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsToMany,
    BelongsTo,
} from 'sequelize-typescript'
import { Game } from 'src/games/entities/game.entity'
import { GameWord } from 'src/words/entities/game-word.entity'

@Table({
    tableName: 'words',
    timestamps: false,
})

export class Word extends Model {
    @Column
    word: string;

    @Column({ field: 'impostor_clue'})
    impostorClue: string;

    @BelongsToMany(() => Game, () => GameWord)
    games: Game[];
}
