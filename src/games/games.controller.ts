import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { GamesService } from './games.service';
import { UpdateGameDto } from './dto/update-game.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/jwt/roles.guard';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('room/:roomId')
  createGame(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.gamesService.createGame(roomId);
  }

  @Post(':id/start')
  startGame(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.startGame(id);
  }

  @Post(':id/vote')
  vote(
    @Param('id', ParseIntPipe) gameId: number,
    @Body() body: { userId: number; targetId: number },
  ) {
    return this.gamesService.vote(
      gameId,
      body.userId,
      body.targetId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return this.gamesService.update(id, updateGameDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.remove(id);
  }

  @Get(':id/state')
  getState(
  @Param('id', ParseIntPipe) gameId: number,
  @Query('userId') userId: number
  ) {
  return this.gamesService.getGameState(gameId, Number(userId));
}
}