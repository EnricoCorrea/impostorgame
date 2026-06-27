import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import {
  GameIdParamDto,
  RoomIdParamDto,
  VoteGameDto,
} from './dto/game-action.dto';
import { GameListQueryDto } from './dto/games-filter.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GamesService } from './games.service';

@ApiTags('Games')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('room/:roomId')
  @ApiOperation({ summary: 'Criar jogo na sala (somente anfitriao)' })
  @ApiCreatedResponse({
    description: 'Jogo e jogadores criados com uma palavra sorteada',
  })
  @ApiBadRequestResponse({
    description: 'Sala sem jogadores/palavras suficientes ou jogo ja ativo',
  })
  createGame(@Param() params: RoomIdParamDto, @Req() req) {
    return this.gamesService.createGame(params.roomId, req.user.id);
  }

  @Post(':id/start')
  @ApiOperation({
    summary: 'Iniciar jogo (somente anfitriao e minimo de 3 jogadores)',
  })
  startGame(@Param() params: GameIdParamDto, @Req() req) {
    return this.gamesService.startGame(params.id, req.user.id);
  }

  @Post(':id/next-phase')
  @ApiOperation({ summary: 'Avancar fase do jogo (somente anfitriao)' })
  nextPhase(@Param() params: GameIdParamDto, @Req() req) {
    return this.gamesService.advancePhase(params.id, req.user.id);
  }
  @Post(':id/vote')
  @ApiOperation({ summary: 'Registrar voto do usuario autenticado' })
  vote(@Param() params: GameIdParamDto, @Req() req, @Body() dto: VoteGameDto) {
    return this.gamesService.vote(params.id, req.user.id, dto.targetId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar jogos' })
  findAll(@Query() query: GameListQueryDto) {
    return this.gamesService.findAll(query, query);
  }

  @Get(':id/state')
  @ApiOperation({ summary: 'Obter estado do jogo sem revelar papeis alheios' })
  getState(@Param() params: GameIdParamDto, @Req() req) {
    return this.gamesService.getGameState(params.id, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar jogo por ID' })
  findOne(@Param() params: GameIdParamDto) {
    return this.gamesService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Jogo atualizado' })
  update(@Param() params: GameIdParamDto, @Body() dto: UpdateGameDto) {
    return this.gamesService.update(params.id, dto);
  }

  @Delete(':id')
  remove(@Param() params: GameIdParamDto) {
    return this.gamesService.remove(params.id);
  }
}
