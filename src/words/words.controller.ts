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
import { UpdateWordDto } from './dto/update-word.dto';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { Query } from '@nestjs/common';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { WordFilterDto } from './dto/words-filter.dto';

@ApiTags('Words')
@ApiBearerAuth()
@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova palavra' })
  @ApiCreatedResponse({ description: 'Palavra criada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @UseGuards(JwtAuthGuard)
  create(@Body() createWordDto: CreateWordDto) {
    return this.wordsService.create(createWordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as palavras' })
  @ApiOkResponse({ description: 'Lista de palavras retornada' })
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() pagination: PaginationDto,
    @Query() filters: WordFilterDto
  ) {
    return this.wordsService.findAll(pagination, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar palavra por ID' })
  @ApiParam({ name: 'id', description: 'ID da palavra' })
  @ApiOkResponse({ description: 'Palavra encontrada' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wordsService.findOne(id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar palavra' })
  @ApiParam({ name: 'id', description: 'ID da palavra' })
  @ApiOkResponse({ description: 'Palavra atualizada com sucesso' })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWordDto: UpdateWordDto,
  ) {
    return this.wordsService.update(id, updateWordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover palavra' })
  @ApiParam({ name: 'id', description: 'ID da palavra' })
  @ApiOkResponse({ description: 'Palavra removida com sucesso' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.wordsService.remove(id);
  }
}