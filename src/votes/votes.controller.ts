import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
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
import { UpdateVoteDto } from './dto/update-vote.dto';
import { CreateVoteDto } from './dto/create-vote.dto';
import { VotesService } from './votes.service';

@ApiTags('Votes')
@ApiBearerAuth()
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um voto' })
  @ApiCreatedResponse({ description: 'Voto criado com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @UseGuards(JwtAuthGuard)
  create(@Body() createVoteDto: CreateVoteDto) {
    return this.votesService.create(createVoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os votos' })
  @ApiOkResponse({ description: 'Lista de votos retornada' })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.votesService.findAll();
  }

  @Get(':roundNumber/:gameId/:voterId')
  @ApiOperation({ summary: 'Buscar voto específico' })
  @ApiParam({ name: 'roundNumber', description: 'Número da rodada' })
  @ApiParam({ name: 'gameId', description: 'ID do jogo' })
  @ApiParam({ name: 'voterId', description: 'ID do votante' })
  @ApiOkResponse({ description: 'Voto encontrado' })
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('roundNumber', ParseIntPipe) roundNumber: number,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('voterId', ParseIntPipe) voterId: number,
  ) {
    return this.votesService.findOne(roundNumber, gameId, voterId);
  }

  @Patch(':roundNumber/:gameId/:voterId')
  @ApiOperation({ summary: 'Atualizar voto' })
  @ApiParam({ name: 'roundNumber', description: 'Número da rodada' })
  @ApiParam({ name: 'gameId', description: 'ID do jogo' })
  @ApiParam({ name: 'voterId', description: 'ID do votante' })
  @ApiOkResponse({ description: 'Voto atualizado com sucesso' })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('roundNumber', ParseIntPipe) roundNumber: number,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('voterId', ParseIntPipe) voterId: number,
    @Body() updateVoteDto: UpdateVoteDto,
  ) {
    return this.votesService.update(
      roundNumber,
      gameId,
      voterId,
      updateVoteDto,
    );
  }

  @Delete(':roundNumber/:gameId/:voterId')
  @ApiOperation({ summary: 'Remover voto' })
  @ApiParam({ name: 'roundNumber', description: 'Número da rodada' })
  @ApiParam({ name: 'gameId', description: 'ID do jogo' })
  @ApiParam({ name: 'voterId', description: 'ID do votante' })
  @ApiOkResponse({ description: 'Voto removido com sucesso' })
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('roundNumber', ParseIntPipe) roundNumber: number,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('voterId', ParseIntPipe) voterId: number,
  ) {
    return this.votesService.remove(roundNumber, gameId, voterId);
  }
}