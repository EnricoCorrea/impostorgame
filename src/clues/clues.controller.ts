import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CluesService } from './clues.service';
import { CreateClueDto } from './dto/create-clue.dto';
import { UpdateClueDto } from './dto/update-clue.dto';

@Controller('clues')
export class CluesController {
  constructor(private readonly cluesService: CluesService) {}

  @Post()
  create(@Body() createClueDto: CreateClueDto) {
    return this.cluesService.create(createClueDto);
  }

  @Get()
  findAll() {
    return this.cluesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cluesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClueDto: UpdateClueDto) {
    return this.cluesService.update(+id, updateClueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cluesService.remove(+id);
  }
}
