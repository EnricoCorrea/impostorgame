import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PlayerRole } from 'src/common/enums/player-role';

export class CreatePlayerDto {
  @ApiProperty({
    example: 1,
    description: 'ID do jogo',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare gameId: number;

  @ApiProperty({
    example: 5,
    description: 'ID do usuario',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare userId: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'ID da palavra associada ao jogador',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare wordId: number;

  @ApiPropertyOptional({
    example: PlayerRole.INNOCENT,
    description: 'Papel do jogador no jogo',
    enum: PlayerRole,
  })
  @IsOptional()
  @IsEnum(PlayerRole)
  declare role: PlayerRole;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica se o jogador e impostor',
  })
  @IsOptional()
  @IsBoolean()
  declare isImpostor: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica se o jogador esta vivo',
  })
  @IsOptional()
  @IsBoolean()
  declare isAlive: boolean;
}
