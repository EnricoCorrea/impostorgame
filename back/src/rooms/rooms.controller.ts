import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  CreateRoomDto,
  KickUserParamDto,
  RoomIdParamDto,
} from './dto/create-room.dto';
import { RoomListQueryDto } from './dto/rooms-filter.dto';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar sala; o usuário autenticado será o anfitrião',
  })
  @ApiCreatedResponse({
    description: 'Sala criada com o anfitrião já incluído',
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  create(@Body() dto: CreateRoomDto, @Req() req) {
    return this.roomsService.create(dto, req.user.id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Entrar em uma sala' })
  @ApiOkResponse({ description: 'Usuário autenticado entrou na sala' })
  joinRoom(@Param() params: RoomIdParamDto, @Req() req) {
    return this.roomsService.joinRoom(params.id, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar salas disponíveis' })
  findAll(@Query() query: RoomListQueryDto) {
    return this.roomsService.findAll(query, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar sala por ID' })
  findOne(@Param() params: RoomIdParamDto) {
    return this.roomsService.findOne(params.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover sala (anfitriao ou ADMIN)' })
  remove(@Param() params: RoomIdParamDto, @Req() req) {
    return this.roomsService.remove(params.id, req.user.id, req.user.role);
  }

  @Post(':id/kick/:userId')
  @ApiOperation({ summary: 'Expulsar jogador da sala (anfitriao)' })
  kickUser(@Param() params: KickUserParamDto, @Req() req) {
    return this.roomsService.kickUser(params.id, params.userId, req.user.id);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Sair da sala' })
  leaveRoom(@Param() params: RoomIdParamDto, @Req() req) {
    return this.roomsService.leaveRoom(params.id, req.user.id);
  }
}
