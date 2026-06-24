import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/enums/dto/pagination.dto';

export class VoteFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  game_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  voter_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  target_player_id?: number;
}

export class VoteListQueryDto extends IntersectionType(
  PaginationDto,
  VoteFilterDto,
) {}
