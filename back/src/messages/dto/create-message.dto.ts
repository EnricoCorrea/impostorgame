import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateMessageDto {
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

  @ApiProperty({ example: 'Diego esta suspeito...', description: 'Conteudo da mensagem' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  declare content: string;
}
