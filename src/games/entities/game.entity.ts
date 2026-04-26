import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo,
    DataType,
} from 'sequelize-typescript'
import { Room } from 'src/rooms/entities/room.entity'

@Table({
    tableName: 'games',
    timestamps: true,
    createdAt: 'started_at',
    updatedAt: false,
})

export class Game extends Model {
    @ForeignKey(() => Room)
    @Column({ field: 'room_id'})
    roomId: number;

    @BelongsTo(() => Room)
    room: Game;

    @Column({
    type: DataType.ENUM('IMPOSTOR', 'INNOCENT'),
    })
    winner: string;

    @Column({
    type: DataType.ENUM('WAITING', 'CLUE', 'DISCUSSING', 'VOTING'),
    })
    status: string;

    @Column({ field: 'round_number'})
    roundNumber: number;

    @Column({ field: 'started_at' })
    startedAt: Date;

    @Column({ field: 'finished_at' })
    finishedAt: Date;
}
