import { Controller, Get, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  create(@Body() createVoteDto: CreateVoteDto) {
    return this.votesService.create(createVoteDto);
  }

  @Get()
  findOne(
    @Query('roundNumber') roundNumber: string,
    @Query('gameId') gameId: string,
    @Query('voterId') voterId: string,
  ) {
    return this.votesService.findOne(+roundNumber, +gameId, +voterId);
  }

  @Patch()
  update(
    @Query('roundNumber') roundNumber: string,
    @Query('gameId') gameId: string,
    @Query('voterId') voterId: string,
    @Body() updateVoteDto: UpdateVoteDto,
  ) {
    return this.votesService.update(
      +roundNumber,
      +gameId,
      +voterId,
      updateVoteDto,
    );
  }

  @Delete()
  remove(
    @Query('roundNumber') roundNumber: string,
    @Query('gameId') gameId: string,
    @Query('voterId') voterId: string,
  ) {
    return this.votesService.remove(
      +roundNumber,
      +gameId,
      +voterId,
    );
  }
}