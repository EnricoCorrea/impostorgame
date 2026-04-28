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
    declare roundNumber: number;

    @PrimaryKey
    @ForeignKey(() => Game)
    @Column({ field: 'game_id' })
    declare gameId: number;

    @PrimaryKey
    @ForeignKey(() => Player)
    @Column({ field: 'voter_id' })
    declare voterId: number;

    @ForeignKey(() => Player)
    @Column({ field: 'target_player_id' })
    declare targetPlayerId: number;

    @BelongsTo(() => Game)
    declare game: Game;

    @BelongsTo(() => Player, 'voter_id')
    declare voter: Player;

    @BelongsTo(() => Player, 'target_player_id')
    declare target: Player;
} 
