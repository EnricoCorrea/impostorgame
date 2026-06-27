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

  constructor(private gamesService: GamesService) {
    this.gamesService.onGameUpdated((update) => {
      if (!update?.roomId) return;
      this.server.to(`room-${update.roomId}`).emit('game_updated', update);
    });
  }

  private emitError(client: Socket | undefined, error: unknown) {
    const message = error instanceof Error ? error.message : 'Acao nao concluida';
    client?.emit('live_error', { message });
  }

  @SubscribeMessage('join_room')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number },
  ) {
    console.log('JOIN ROOM:', data);
    client.join(`room-${data.roomId}`);
  }

  @SubscribeMessage('start_game')
  async handleStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: number; roomId: number },
  ) {
    console.log('START GAME:', data);

    try {
      await this.gamesService.startGame(data.gameId);
    } catch (error) {
      this.emitError(client, error);
    }
  }

  @SubscribeMessage('next_phase')
  async handleNextPhase(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: number; roomId: number },
  ) {
    console.log('NEXT PHASE:', data);

    try {
      await this.gamesService.advancePhase(data.gameId);
    } catch (error) {
      this.emitError(client, error);
    }
  }

  @SubscribeMessage('vote')
  async handleVote(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      gameId: number;
      userId: number;
      targetId: number;
      roomId: number;
    },
  ) {
    console.log('VOTE:', data);

    try {
      await this.gamesService.vote(data.gameId, data.userId, data.targetId);
    } catch (error) {
      this.emitError(client, error);
    }
  }
}
