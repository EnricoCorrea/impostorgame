import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { GamesService } from './games.service';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import { GameFilterDto } from './dto/games-filter.dto';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('room/:roomId')
  @ApiOperation({ summary: 'Criar um novo jogo em uma sala' })
  @ApiParam({ name: 'roomId', description: 'ID da sala' })
  @ApiCreatedResponse({ description: 'Jogo criado com sucesso' })
  @ApiBadRequestResponse({ description: 'Já existe jogo ativo na sala' })
  createGame(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.gamesService.createGame(roomId);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Iniciar um jogo' })
  @ApiParam({ name: 'id', description: 'ID do jogo' })
  @ApiOkResponse({ description: 'Jogo iniciado com sucesso' })
  startGame(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.startGame(id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os jogos' })
  @ApiOkResponse({ description: 'Lista de jogos retornada' })
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.findOne(id);
  }

  @Get(':id/state')
  @ApiOperation({ summary: 'Obter estado do jogo para o usuário' })
  @ApiParam({ name: 'id', description: 'ID do jogo' })
  @ApiOkResponse({ description: 'Estado do jogo retornado' })
  getState(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.gamesService.getGameState(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar jogo' })
  @ApiParam({ name: 'id', description: 'ID do jogo' })
  @ApiOkResponse({ description: 'Jogo atualizado com sucesso' })
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.remove(id);
  }
}