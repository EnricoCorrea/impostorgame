import { ApiProperty } from '@nestjs/swagger';

export enum GameStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export class CreateGameDto {
  @ApiProperty({
    example: 1,
    description: 'ID da sala associada ao jogo',
  })
  declare roomId: number;

  @ApiProperty({
    enum: GameStatus,
    example: GameStatus.WAITING,
    description: 'Status atual do jogo',
  })
  declare status: GameStatus;


}
