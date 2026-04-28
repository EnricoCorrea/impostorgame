import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class GameFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  room_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  round_number?: number;
}