import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class WordFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  word?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  impostorClue?: string;
}