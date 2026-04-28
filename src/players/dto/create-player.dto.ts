import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({
    example: 1,
    description: 'ID do jogo',
  })
  declare gameId: number;

  @ApiProperty({
    example: 5,
    description: 'ID do usuário',
  })
  declare userId: number;

  @ApiProperty({
    example: 10,
    description: 'ID da palavra associada ao jogador',
    required: false,
  })
  declare wordId: number;

  @ApiProperty({
    example: 'INNOCENT',
    description: 'Papel do jogador no jogo',
    required: false,
  })
  declare role: string;

  @ApiProperty({
    example: false,
    description: 'Indica se o jogador é impostor',
    required: false,
  })
  declare isImpostor: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica se o jogador está vivo',
    required: false,
  })
  declare isAlive: boolean;
}