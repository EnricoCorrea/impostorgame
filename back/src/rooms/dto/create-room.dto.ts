import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Sala 1' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  declare name: string;

  @ApiProperty({ example: 5, minimum: 3, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Max(5)
  declare maxUsers: number;
}

export class RoomIdParamDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare id: number;
}

export class RoomIdPathDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare roomId: number;
}
