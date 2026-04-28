import {
    Table,
    Column,
    Model,
    ForeignKey,
    DataType,
    BelongsTo,
} from 'sequelize-typescript'

import {Game} from 'src/games/entities/game.entity'
import {User} from 'src/users/entities/user.entity'
import {Word} from 'src/words/entities/word.entity'

@Table({
    tableName: 'players',
    timestamps: false,
})


export class Player extends Model {

    @ForeignKey(() => Game)
    
    @Column({
        field: "game_id"
    })
    declare gameId: number;

    @ForeignKey(() => User)
    
    @Column({
        field: "user_id"
    })
    declare userId: number;
    
    @ForeignKey(() => Word)
    
    @Column({
        field: "word_id"
    })
    declare wordId: number;

    @Column({ 
       type:  DataType.ENUM('IMPOSTOR','INNOCENT')
    })
    declare role: string;

    @Column({
        field: 'is_alive'
    })
    declare isAlive: boolean;

    @BelongsTo(() => Game)
    declare game: Game;
    
    @BelongsTo(() => User)
    declare user: User;
    
    @BelongsTo(() => Word)
    declare word: Word;
} 



