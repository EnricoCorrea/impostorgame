import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { Game } from './entities/game.entity';
import { Room } from '../rooms/entities/room.entity';
import { Player } from 'src/players/entities/player.entity';
import { Vote } from 'src/votes/entities/vote.entity';
import { User } from 'src/users/entities/user.entity';
import { paginate } from '../common/enums/utils/paginate';
import { PaginationDto } from 'src/common/enums/dto/pagination.dto';
import {
  clearPhaseExpiration,
  hasPhaseExpired,
  setPhaseExpiration,
} from '../common/enums/utils/phase-timeout-store';
import { GameFilterDto } from './dto/games-filter.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game)
    private gameModel: typeof Game,

    @InjectModel(Player)
    private playerModel: typeof Player,

    @InjectModel(Vote)
    private voteModel: typeof Vote,

    @InjectModel(Room)
    private roomModel: typeof Room,
  ) { }

  async findAll(
    pagination: PaginationDto,
    filters: GameFilterDto,
  ) {
    const where = {
      ...(filters.room_id && { room_id: filters.room_id }),
      ...(filters.round_number && { round_number: filters.round_number }),
    };
  
    return paginate(this.gameModel, pagination, {
      where,
      distinct: true,
      include: [
        { model: Room },
      ],
    });
  }

  async findOne(id: number) {
    const game = await this.gameModel.findByPk(id, {
      include: [Room],
    });

    if (!game) throw new NotFoundException('Game not found');

    return game;
  }

  async update(id: number, data: any) {
    const game = await this.gameModel.findByPk(id);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    await game.update(data);
    return game;
  }

  async remove(id: number) {
    const game = await this.gameModel.findByPk(id);

    if (!game) throw new NotFoundException('Game not found');

    clearPhaseExpiration(game.id);
    await game.destroy();

    return game;
  }

  async createGame(roomId: number) {
    const activeGame = await this.gameModel.findOne({
      where: {
        roomId,
        finishedAt: null,
      },
    });

    if (activeGame) {
      throw new BadRequestException(
        'Game already in progress in this room',
      );
    }

    const room = await this.roomModel.findByPk(roomId, {
      include: [User],
    });

    if (!room) throw new NotFoundException('Room not found');

    if (room.users.length < 3) {
      throw new BadRequestException(
        'A sala precisa ter pelo menos 3 usuários para iniciar um jogo',
      );
    }

    const game = await this.gameModel.create({
      roomId,
      status: 'WAITING',
      roundNumber: 0,
    });

    for (const user of room.users) {
      await this.playerModel.create({
        gameId: game.id,
        userId: user.id,
        isAlive: true,
      });
    }

    return game;
  }

  async startGame(gameId: number) {
    const game = await this.gameModel.findByPk(gameId, {
      include: [Player],
    });

    if (!game) throw new NotFoundException('Game not found');

    if (game.finishedAt) {
      throw new BadRequestException('Game already finished');
    }

    if (game.status !== 'WAITING') {
      throw new BadRequestException('Game already started');
    }

    if (game.players.length < 3) {
      throw new BadRequestException('Not enough players');
    }

    await this.voteModel.destroy({ where: { gameId } });

    await this.assignRoles(game.players);

    game.status = 'CLUE';
    game.roundNumber = 1;

    await game.save();
    this.schedulePhaseTimeout(game);

    return game;
  }

  async assignRoles(players: Player[]) {
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    const impostorCount = 1;

    for (let i = 0; i < shuffled.length; i++) {
      const p = shuffled[i];

      p.role = i < impostorCount ? 'IMPOSTOR' : 'INNOCENT';
      p.isAlive = true;

      await p.save();
    }
  }

  nextPhase(game: Game) {
    switch (game.status) {
      case 'CLUE':
        game.status = 'DISCUSSING';
        break;

      case 'DISCUSSING':
        game.status = 'VOTING';
        break;

      case 'VOTING':
        game.status = 'CLUE';
        game.roundNumber += 1;
        break;
    }
  }

  async vote(gameId: number, voterId: number, targetId: number) {
    const game = await this.gameModel.findByPk(gameId);

    if (!game) throw new NotFoundException('Game not found');

    if (hasPhaseExpired(gameId)) {
      throw new BadRequestException('Tempo de votação expirou; rodada ignorada.');
    }

    if (game.status !== 'VOTING') {
      throw new BadRequestException('Not in voting phase');
    }

    const player = await this.playerModel.findOne({
      where: { gameId, userId: voterId },
    });

    if (!player) {
      throw new NotFoundException('Player not found in this game');
    }

    if (!player.isAlive) {
      throw new BadRequestException('Dead players cannot vote');
    }

    const target = await this.playerModel.findByPk(targetId);

    if (!target || target.gameId !== gameId) {
      throw new BadRequestException('Invalid target');
    }

    if (!target.isAlive) {
      throw new BadRequestException('Cannot vote on dead player');
    }

    const existingVote = await this.voteModel.findOne({
      where: { gameId, voterId },
    });

    if (existingVote) {
      throw new BadRequestException('Player already voted');
    }

    await this.voteModel.create({
      gameId,
      voterId,
      targetPlayerId: targetId,
    });

    return this.checkAllVoted(gameId);
  }

  async checkAllVoted(gameId: number) {
    const alivePlayers = await this.playerModel.findAll({
      where: { gameId, isAlive: true },
    });

    const votes = await this.voteModel.findAll({
      where: { gameId },
    });

    if (votes.length >= alivePlayers.length) {
      return this.resolveVoting(gameId);
    }

    return { message: 'Vote registered' };
  }

  async schedulePhaseTimeout(game: Game) {
    clearPhaseExpiration(game.id);

    if (game.status !== 'CLUE' && game.status !== 'VOTING') {
      return;
    }

    const timer = setTimeout(async () => {
      const currentGame = await this.gameModel.findByPk(game.id, {
        include: [Player],
      });

      if (!currentGame || currentGame.finishedAt) {
        return;
      }

      if (currentGame.status === 'CLUE') {
        this.nextPhase(currentGame);
        await currentGame.save();
        this.schedulePhaseTimeout(currentGame);
        return;
      }

      if (currentGame.status === 'VOTING') {
        await this.resolveVoting(currentGame.id);
      }
    }, 15000);

    setPhaseExpiration(game.id, Date.now() + 15000, timer);
  }

  async getGameState(gameId: number, userId: number) {
    const game = await this.gameModel.findByPk(gameId, {
      include: [Player],
    });

    if (!game) throw new NotFoundException('Game not found');

    const me = game.players.find(p => p.userId === userId);

    return {
      status: game.status,
      round: game.roundNumber,
      finishedAt: game.finishedAt,
      winner: game.finishedAt ? game.winner : null,

      players: game.players.map(p => ({
        id: p.id,
        userId: p.userId,
        isAlive: p.isAlive,
      })),

      myRole: me?.role || null,
    };
  }

  async resolveVoting(gameId: number) {
    const votes = await this.voteModel.findAll({
      where: { gameId },
    });

    if (votes.length === 0) {
      return this.checkWin(gameId);
    }

    const count: Record<number, number> = {};

    for (const vote of votes) {
      count[vote.targetPlayerId] =
        (count[vote.targetPlayerId] || 0) + 1;
    }

    const maxVotes = Math.max(...Object.values(count));

    const tiedPlayers = Object.keys(count).filter(
      (id) => count[Number(id)] === maxVotes,
    );

    // Se tiver empate ninguém sai
    if (tiedPlayers.length > 1) {
      await this.voteModel.destroy({
        where: { gameId },
      });

      const game = await this.gameModel.findByPk(gameId);

      if (!game) {
        throw new NotFoundException('Game not found');
      }

      this.nextPhase(game);
      await game.save();

      return {
        message: 'Tie vote. No player eliminated.',
      };
    }

    const eliminatedId = Number(tiedPlayers[0]);

    const player = await this.playerModel.findByPk(eliminatedId);

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    player.isAlive = false;
    await player.save();

    await this.voteModel.destroy({
      where: { gameId },
    });

    return this.checkWin(gameId);
  }

  async checkWin(gameId: number) {
    const players = await this.playerModel.findAll({
      where: { gameId },
    });

    const alive = players.filter((p) => p.isAlive);

    const impostors = alive.filter(
      (p) => p.role === 'IMPOSTOR',
    ).length;

    const innocents = alive.filter(
      (p) => p.role === 'INNOCENT',
    ).length;

    if (impostors === 0) {
      return this.finishGame(gameId, 'INNOCENT');
    }

    if (impostors >= innocents) {
      return this.finishGame(gameId, 'IMPOSTOR');
    }

    const game = await this.gameModel.findByPk(gameId);

    if (!game) {
      throw new NotFoundException('Game does not exist!');
    }

    this.nextPhase(game);
    await game.save();

    return game;
  }

  async finishGame(gameId: number, winner: string) {
    const game = await this.gameModel.findByPk(gameId);

    if (!game) {
      throw new NotFoundException('Game does not exist!');
    }

    game.status = 'WAITING';
    game.winner = winner;
    game.finishedAt = new Date();

    await game.save();

    return game;
  }
}