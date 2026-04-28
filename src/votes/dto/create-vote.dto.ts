import { ApiProperty } from '@nestjs/swagger';

export class CreateVoteDto {
  @ApiProperty({
    example: 1,
    description: 'Número da rodada',
  })
  declare roundNumber: number;

  @ApiProperty({
    example: 1,
    description: 'ID do jogo',
  })
  declare gameId: number;

  @ApiProperty({
    example: 10,
    description: 'ID do jogador que está votando',
  })
  declare voterId: number;

  @ApiProperty({
    example: 15,
    description: 'ID do jogador alvo do voto',
  })
  declare targetPlayerId: number;
}