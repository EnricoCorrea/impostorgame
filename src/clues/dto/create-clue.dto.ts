import { ApiProperty } from '@nestjs/swagger';

export class CreateClueDto {
  @ApiProperty({
    example: 1,
    description: 'ID do jogo',
  })
  declare gameId: number;

  @ApiProperty({
    example: 10,
    description: 'ID do jogador',
  })
  declare playerId: number;

  @ApiProperty({
    example: 1,
    description: 'Número da rodada',
  })
  declare roundNumber: number;

  @ApiProperty({
    example: 'Frio',
    description: 'Dica fornecida pelo jogador',
  })
  declare clue: string;
}