import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { GamesService } from './games.service';
import { Query } from '@nestjs/common';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import { GameFilterDto } from './dto/games-filter.dto';

@ApiTags('Games')
@ApiBearerAuth()
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('room/:roomId')
  @ApiOperation({ summary: 'Criar um novo jogo em uma sala' })
  @ApiParam({ name: 'roomId', description: 'ID da sala' })
  @ApiCreatedResponse({ description: 'Jogo criado com sucesso' })
  @ApiBadRequestResponse({ description: 'Já existe jogo ativo na sala' })
  @UseGuards(JwtAuthGuard)
  createGame(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.gamesService.createGame(roomId);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Iniciar um jogo' })
  @ApiParam({ name: 'id', description: 'ID do jogo' })
  @ApiOkResponse({ description: 'Jogo iniciado com sucesso' })
  @UseGuards(JwtAuthGuard)
  startGame(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.startGame(id);
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Registrar voto no jogo' })
  @ApiParam({ name: 'id', description: 'ID do jogo' })
  @ApiOkResponse({ description: 'Voto registrado' })
  @UseGuards(JwtAuthGuard)
  vote(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() body: { targetId: number },
  ) {
    return this.gamesService.vote(id, req.user.id, body.targetId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os jogos' })
  @ApiOkResponse({ description: 'Lista de jogos retornada' })
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() pagination: PaginationDto,
    @Query() filters: GameFilterDto
  ) {
    return this.gamesService.findAll(pagination, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar jogo por ID' })
  @ApiParam({ name: 'id', description: 'ID do jogo' })
  @ApiOkResponse({ description: 'Jogo encontrado' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.findOne(id);
  }

  @Get(':id/state')
  @ApiOperation({ summary: 'Obter estado do jogo para o usuário' })
  @ApiParam({ name: 'id', description: 'ID do jogo' })
  @ApiOkResponse({ description: 'Estado do jogo retornado' })
  @UseGuards(JwtAuthGuard)
  getState(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.gamesService.getGameState(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar jogo' })
  @ApiParam({ name: 'id', description: 'ID do jogo' })
  @ApiOkResponse({ description: 'Jogo atualizado com sucesso' })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameDto: any,
  ) {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover jogo' })
  @ApiParam({ name: 'id', description: 'ID do jogo' })
  @ApiOkResponse({ description: 'Jogo removido com sucesso' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.remove(id);
  }
}