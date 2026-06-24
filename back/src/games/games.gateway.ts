import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GamesService } from './games.service';

@WebSocketGateway({
  cors: true,
})
export class GamesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private gamesService: GamesService) {}

  @SubscribeMessage('join_room')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number },
  ) {
    console.log('JOIN ROOM:', data);
    client.join(`room-${data.roomId}`);
  }

  @SubscribeMessage('start_game')
  async handleStart(@MessageBody() data: { gameId: number; roomId: number }) {
    console.log('START GAME:', data);

    const game = await this.gamesService.startGame(data.gameId);

    this.server.to(`room-${data.roomId}`).emit('game_updated', game);
  }

  @SubscribeMessage('vote')
  async handleVote(
    @MessageBody()
    data: {
      gameId: number;
      userId: number;
      targetId: number;
      roomId: number;
    },
  ) {
    console.log('VOTE:', data);

    await this.gamesService.vote(data.gameId, data.userId, data.targetId);

    this.server.to(`room-${data.roomId}`).emit('game_updated', { ok: true });
  }
}
