import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 'Sala 1' })
  declare name: string;

  @ApiProperty({ example: 10 })
  declare maxPlayers: number;
}

export class JoinRoomDto {
  @ApiProperty({ example: 1 })
  declare roomId: number;

  @ApiProperty({ example: 5 })
  declare userId: number;
}