import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript'

import {Game} from 'src/games/entities/game.entity'
import {Player} from 'src/players/entities/player.entity'

@Table({
    tableName: 'clues',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
})


export class Clue extends Model {
    @ForeignKey(() => Game)
    
    @Column({
        field: "game_id"
    })
    gameId: number;

    @ForeignKey(() => Player)
    
    @Column({
        field: "player_id"
    })
    playerId: number;
       
    @Column({field: "round_number"})
    roundNumber: string;

    @Column
    clue: string;

    @BelongsTo(() => Game)
    games: Game;
    
    @BelongsTo(() => Player)
    players: Player;

} 



