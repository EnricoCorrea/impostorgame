import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo,
    PrimaryKey
} from 'sequelize-typescript'

import { Game } from 'src/games/entities/game.entity';
import { Player } from 'src/players/entities/player.entity';

@Table({
    tableName: 'votes',
    timestamps: false,
})

export class Vote extends Model {
    @PrimaryKey
    @Column({ field: 'round_number' })
    roundNumber: number;

    @PrimaryKey
    @ForeignKey(() => Game)
    @Column({ field: 'game_id' })
    gameId: number;

    @PrimaryKey
    @ForeignKey(() => Player)
    @Column({ field: 'voter_id' })
    voterId: number;

    @ForeignKey(() => Player)
    @Column({ field: 'target_player_id' })
    targetPlayerId: number;

    @BelongsTo(() => Game)
    game: Game;

    @BelongsTo(() => Player, 'voter_id')
    voter: Player;

    @BelongsTo(() => Player, 'target_player_id')
    target: Player;
} 
