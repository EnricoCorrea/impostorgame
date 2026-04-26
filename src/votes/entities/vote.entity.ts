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

export class Vote extends Model {} 
