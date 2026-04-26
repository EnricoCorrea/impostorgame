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
    gameId: number;

    @ForeignKey(() => User)
    
    @Column({
        field: "user_id"
    })
    userId: number;
    
    @ForeignKey(() => Word)
    
    @Column({
        field: "word_id"
    })
    wordId: number;

    @Column({ 
       type:  DataType.ENUM('IMPOSTOR','INNOCENT')
    })
    role: string;

    @Column({
        field: 'is_alive'
    })
    isAlive: boolean;

    @BelongsTo(() => Game)
    games: Game;
    
    @BelongsTo(() => User)
    users: User;
    
    @BelongsTo(() => Word)
    words: Word;
} 



