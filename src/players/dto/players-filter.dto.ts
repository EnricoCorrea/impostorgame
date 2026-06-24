import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/enums/dto/pagination.dto';

export class PlayerFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  game_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  user_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  word_id?: number;
}

export class PlayerListQueryDto extends IntersectionType(
  PaginationDto,
  PlayerFilterDto,
) {}
