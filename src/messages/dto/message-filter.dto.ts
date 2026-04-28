import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class MessageFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  game_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  player_id?: number;
}