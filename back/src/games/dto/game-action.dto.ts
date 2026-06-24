import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GameIdParamDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id!: number;
}

export class RoomIdParamDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roomId!: number;
}

export class VoteGameDto {
  @ApiProperty({ example: 3, description: 'ID do jogador que receberá o voto' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  targetId!: number;
}
