import { Controller, Get, Post, Body, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/jwt/roles.guard';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  create(@Body() createVoteDto: CreateVoteDto) {
    return this.votesService.create(createVoteDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findOne(
    @Query('roundNumber') roundNumber: string,
    @Query('gameId') gameId: string,
    @Query('voterId') voterId: string,
  ) {
    return this.votesService.findOne(+roundNumber, +gameId, +voterId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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