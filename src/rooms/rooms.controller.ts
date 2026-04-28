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

import { RoomsService } from './rooms.service';
import { CreateRoomDto, JoinRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/jwt/roles.guard';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { Query } from '@nestjs/common';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import { RoomFilterDto } from './dto/rooms-filter.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova sala' })
  @ApiCreatedResponse({ description: 'Sala criada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Entrar em uma sala' })
  @ApiParam({ name: 'id', description: 'ID da sala' })
  @ApiOkResponse({ description: 'Usuário entrou na sala' })
  joinRoom(
    @Param('id', ParseIntPipe) roomId: number,
    @Body() body: JoinRoomDto,
  ) {
    return this.roomsService.joinRoom(roomId, body.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as salas (ADMIN)' })
  @ApiOkResponse({ description: 'Lista de salas retornada com sucesso' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(
    @Query() pagination: PaginationDto,
    @Query() filters: RoomFilterDto
  ) {
    return this.roomsService.findAll(pagination, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma sala por ID (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID da sala' })
  @ApiOkResponse({ description: 'Sala encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma sala (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID da sala' })
  @ApiOkResponse({ description: 'Sala removida com sucesso' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(id);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Sair da sala' })
  @ApiParam({ name: 'id', description: 'ID da sala' })
  @ApiOkResponse({ description: 'Usuário saiu da sala' })
  leaveRoom(
    @Param('id', ParseIntPipe) roomId: number,
    @Body() body: JoinRoomDto,
  ) {
    return this.roomsService.leaveRoom(roomId, body.userId);
  }
}