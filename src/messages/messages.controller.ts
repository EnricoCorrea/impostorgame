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

import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';
import { Query } from '@nestjs/common';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import { MessageFilterDto } from './dto/message-filter.dto';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova mensagem' })
  @ApiCreatedResponse({ description: 'Mensagem criada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as mensagens' })
  @ApiOkResponse({ description: 'Lista de mensagens retornada' })
  findAll(
      @Query() pagination: PaginationDto,
      @Query() filters: MessageFilterDto
    ) {
      return this.messagesService.findAll(pagination, filters);
    }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar mensagem por ID' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiOkResponse({ description: 'Mensagem encontrada' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiOkResponse({ description: 'Mensagem atualizada com sucesso' })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiOkResponse({ description: 'Mensagem removida com sucesso' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.remove(id);
  }
}