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
import { UpdateClueDto } from './dto/update-clue.dto';
import { CreateClueDto } from './dto/create-clue.dto';
import { CluesService } from './clues.service';

@ApiTags('Clues')
@ApiBearerAuth()
@Controller('clues')
export class CluesController {
  constructor(private readonly cluesService: CluesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova dica' })
  @ApiCreatedResponse({ description: 'Dica criada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @UseGuards(JwtAuthGuard)
  create(@Body() createClueDto: CreateClueDto) {
    return this.cluesService.create(createClueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as dicas' })
  @ApiOkResponse({ description: 'Lista de dicas retornada' })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.cluesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar dica por ID' })
  @ApiParam({ name: 'id', description: 'ID da dica' })
  @ApiOkResponse({ description: 'Dica encontrada' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cluesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dica' })
  @ApiParam({ name: 'id', description: 'ID da dica' })
  @ApiOkResponse({ description: 'Dica atualizada com sucesso' })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClueDto: UpdateClueDto,
  ) {
    return this.cluesService.update(id, updateClueDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover dica' })
  @ApiParam({ name: 'id', description: 'ID da dica' })
  @ApiOkResponse({ description: 'Dica removida com sucesso' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cluesService.remove(id);
  }
}