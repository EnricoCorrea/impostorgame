import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo,
    DataType,
} from 'sequelize-typescript'

@Table({
    tableName: 'votes',
    timestamps: true,
    createdAt: 'started_at',
    updatedAt: false,
})

export class Vote extends Model {
    @Column({
        field: "round_number"
    })
    roundNumber: number;

    @ForeignKey(() => Game)
    
    @Column({
        field: "game_id"
    })
    gameId: number;

    @ForeignKey(() => Player)
    
    @Column({
        field: "player_id"
    })
    gameId: number;
} 
