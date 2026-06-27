import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateClueDto {
  @ApiProperty({ example: 1, description: 'ID do jogo' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare gameId: number;

  @ApiProperty({ example: 10, description: 'ID do jogador' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare playerId: number;

  @ApiProperty({ example: 1, description: 'Numero da rodada' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare roundNumber: number;

  @ApiProperty({ example: 'Frio', description: 'Dica fornecida pelo jogador' })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  declare clue: string;
}
