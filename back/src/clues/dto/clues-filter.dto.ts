import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/enums/dto/pagination.dto';

export class ClueFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  game_id?: number;
}

export class ClueListQueryDto extends IntersectionType(
  PaginationDto,
  ClueFilterDto,
) {}
