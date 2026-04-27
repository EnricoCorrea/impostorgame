import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GameService } from './game-logic.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Game')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}


  @Post('start/:roomId')
  startGame(@Param('roomId') roomId: string, @Request() req) {
    const userId = req.user.userId;
    return this.gameService.startGame(Number(roomId), userId);
  }

  @Post('next-phase/:gameId')
  nextPhase(@Param('gameId') gameId: string) {
    return this.gameService.nextPhase(Number(gameId));
  }

  @Post('clue/:gameId')
  sendClue(
    @Param('gameId') gameId: string,
    @Body() body: { content: string },
    @Request() req,
  ) {
    return this.gameService.sendClue(
      Number(gameId),
      req.user.userId,
      body.content,
    );
  }

  @Post('message/:gameId')
  sendMessage(
    @Param('gameId') gameId: string,
    @Body() body: { content: string },
    @Request() req,
  ) {
    return this.gameService.sendMessage(
      Number(gameId),
      req.user.userId,
      body.content,
    );
  }

  @Post('vote/:gameId')
  vote(
    @Param('gameId') gameId: string,
    @Body() body: { votedPlayerId: number | null },
    @Request() req,
  ) {
    return this.gameService.vote(
      Number(gameId),
      req.user.userId,
      body.votedPlayerId,
    );
  }

  @Get(':gameId')
  getGame(@Param('gameId') gameId: string) {
    return this.gameService.getGameState(Number(gameId));
  }
}
