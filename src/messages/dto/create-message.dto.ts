import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
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
    example: 'Diego está suspeito...',
    description: 'Conteúdo da mensagem',
  })
  declare content: string;
}
