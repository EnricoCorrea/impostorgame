import { ApiProperty } from '@nestjs/swagger';

export class CreateWordDto {
  @ApiProperty({
    example: 'Praia',
    description: 'Palavra do jogo',
  })
  declare word: string;

  @ApiProperty({
    example: 'Lugar quente com areia',
    description: 'Dica para o impostor',
  })
  declare impostorClue: string;
}