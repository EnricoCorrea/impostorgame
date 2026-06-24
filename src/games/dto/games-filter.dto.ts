import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/enums/dto/pagination.dto';

export class GameFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  room_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  round_number?: number;
}

export class GameListQueryDto extends IntersectionType(
  PaginationDto,
  GameFilterDto,
) {}
