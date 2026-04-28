import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';

export class ClueFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  game_id?: number;
}