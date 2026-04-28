import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo,
    BelongsToMany,
    DataType,
    HasMany,
} from 'sequelize-typescript'
import { Room } from 'src/rooms/entities/room.entity'
import { Word } from 'src/words/entities/word.entity'
import { Player } from 'src/players/entities/player.entity'
import { GameWord } from 'src/words/entities/game-word.entity'

@Table({
    tableName: 'games',
    timestamps: true,
    createdAt: 'started_at',
    updatedAt: false,
})

export class Game extends Model {
    @ForeignKey(() => Room)
    @Column({ field: 'room_id'})
    declare roomId: number;

    @BelongsTo(() => Room)
    declare room: Room;

    @Column({
    type: DataType.ENUM('IMPOSTOR', 'INNOCENT'),
    })
    declare winner: string;

    @Column({
    type: DataType.ENUM('WAITING', 'CLUE', 'DISCUSSING', 'VOTING'),
    })
    declare status: string;

    @Column({ field: 'round_number'})
    declare roundNumber: number;

    @Column({ field: 'started_at' })
    declare startedAt: Date;

    @Column({ field: 'finished_at' })
    declare finishedAt: Date;

    @BelongsToMany(() => Word, () => GameWord)
    declare words: Word[];

    @HasMany(() => Player)
    declare players: Player[];
}
