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
import { UpdatePlayerDto } from './dto/update-player.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayersService } from './players.service';
import { Query } from '@nestjs/common';
import { PlayerListQueryDto } from './dto/players-filter.dto';

@ApiTags('Players')
@ApiBearerAuth()
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um jogador' })
  @ApiCreatedResponse({ description: 'Jogador criado com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @UseGuards(JwtAuthGuard)
  create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.create(createPlayerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os jogadores' })
  @ApiOkResponse({ description: 'Lista de jogadores retornada' })
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: PlayerListQueryDto) {
    return this.playersService.findAll(query, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar jogador por ID' })
  @ApiParam({ name: 'id', description: 'ID do jogador' })
  @ApiOkResponse({ description: 'Jogador encontrado' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar jogador' })
  @ApiParam({ name: 'id', description: 'ID do jogador' })
  @ApiOkResponse({ description: 'Jogador atualizado com sucesso' })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    return this.playersService.update(id, updatePlayerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover jogador' })
  @ApiParam({ name: 'id', description: 'ID do jogador' })
  @ApiOkResponse({ description: 'Jogador removido com sucesso' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.remove(id);
  }
}
