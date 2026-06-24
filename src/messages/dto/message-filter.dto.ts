import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/enums/dto/pagination.dto';

export class MessageFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  game_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  player_id?: number;
}

export class MessageListQueryDto extends IntersectionType(
  PaginationDto,
  MessageFilterDto,
) {}
