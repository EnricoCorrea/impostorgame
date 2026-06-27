import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateVoteDto {
  @ApiProperty({
    example: 1,
    description: 'Numero da rodada',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare roundNumber: number;

  @ApiProperty({
    example: 1,
    description: 'ID do jogo',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare gameId: number;

  @ApiProperty({
    example: 10,
    description: 'ID do jogador que esta votando',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare voterId: number;

  @ApiProperty({
    example: 15,
    description: 'ID do jogador alvo do voto',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare targetPlayerId: number;
}
