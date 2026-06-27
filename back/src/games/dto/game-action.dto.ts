import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

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
  @ApiPropertyOptional({ example: 3, description: 'ID do jogador que recebera o voto. Omita para pular.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  targetId?: number;
}
