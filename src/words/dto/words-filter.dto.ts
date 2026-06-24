import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/enums/dto/pagination.dto';

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

export class WordListQueryDto extends IntersectionType(
  PaginationDto,
  WordFilterDto,
) {}
