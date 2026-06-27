import {
  BadRequestException,
  ForbiddenException,
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
  getPhaseExpiration,
  hasPhaseExpired,
  setPhaseExpiration,
} from '../common/enums/utils/phase-timeout-store';
import { GameFilterDto } from './dto/games-filter.dto';
import { Word } from '../words/entities/word.entity';
import { GameWord } from '../words/entities/game-word.entity';
import { Clue } from 'src/clues/entities/clue.entity';

@Injectable()
export class GamesService {
  private gameUpdatedHandlers: Array<(update: any) => void> = [];

  constructor(
    @InjectModel(Game)
    private gameModel: typeof Game,

    @InjectModel(Player)
    private playerModel: typeof Player,

    @InjectModel(Vote)
    private voteModel: typeof Vote,

    @InjectModel(Room)
    private roomModel: typeof Room,

    @InjectModel(Word)
    private wordModel: typeof Word,

    @InjectModel(GameWord)
    private gameWordModel: typeof GameWord,
  
    @InjectModel(Clue)
    private clueModel: typeof Clue,
  ) {}

  onGameUpdated(handler: (update: any) => void) {
    this.gameUpdatedHandlers.push(handler);
  }

  async getLiveUpdate(gameId: number) {
    const game = await this.gameModel.findByPk(gameId);

    if (!game) throw new NotFoundException('Game not found');

    const votes = await this.voteModel.findAll({
      where: { gameId, roundNumber: game.roundNumber },
    });

    const scoresByTarget = votes.reduce<Record<number, number>>((acc, vote) => {
      if (vote.targetPlayerId == null) return acc;
      acc[vote.targetPlayerId] = (acc[vote.targetPlayerId] || 0) + 1;
      return acc;
    }, {});

    const phaseExpiration = getPhaseExpiration(game.id);

    return {
      gameId: game.id,
      roomId: game.roomId,
      status: game.status,
      roundNumber: game.roundNumber,
      winner: game.winner ?? null,
      finishedAt: game.finishedAt ?? null,
      phaseEndsAt: phaseExpiration
        ? new Date(phaseExpiration).toISOString()
        : undefined,
      scores: Object.entries(scoresByTarget).map(([targetId, votes]) => ({
        targetId: Number(targetId),
        votes,
      })),
    };
  }

  private async notifyGameUpdated(gameId: number) {
    if (!this.gameUpdatedHandlers.length) return;
    const update = await this.getLiveUpdate(gameId);
    for (const handler of this.gameUpdatedHandlers) {
      handler(update);
    }
  }

  async findAll(pagination: PaginationDto, filters: GameFilterDto) {
    const where = {
      ...(filters.room_id && { roomId: filters.room_id }),
      ...(filters.round_number && { roundNumber: filters.round_number }),
    };

    return paginate(this.gameModel, pagination, {
      where,
      distinct: true,
      include: [{ model: Room }],
      order: [['id', 'DESC']],
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

  async createGame(roomId: number, requestingUserId?: number) {
    const activeGame = await this.gameModel.findOne({
      where: {
        roomId,
        finishedAt: null,
      },
    });

    if (activeGame) {
      throw new BadRequestException('Game already in progress in this room');
    }

    const room = await this.roomModel.findByPk(roomId, {
      include: [{ model: User, as: 'users' }],
    });

    if (!room) throw new NotFoundException('Room not found');

    if (requestingUserId != null && room.hostId !== requestingUserId) {
      throw new ForbiddenException('Somente o anfitri\u00e3o pode criar o jogo');
    }

    if (room.users.length < 3) {
      throw new BadRequestException(
        'A sala precisa ter pelo menos 3 usu\u00e1rios para iniciar um jogo',
      );
    }

    const words = await this.wordModel.findAll();
    if (words.length === 0) {
      throw new BadRequestException(
        'Cadastre ao menos uma palavra antes de criar o jogo',
      );
    }
    const selectedWord = words[Math.floor(Math.random() * words.length)];

    const game = await this.gameModel.create({
      roomId,
      status: 'WAITING',
      roundNumber: 0,
    });

    await this.gameWordModel.create({
      gameId: game.id,
      wordId: selectedWord.id,
    });

    for (const user of room.users) {
      await this.playerModel.create({
        gameId: game.id,
        userId: user.id,
        wordId: selectedWord.id,
        role: 'INNOCENT',
        isAlive: true,
      });
    }

    return game;
  }

  async startGame(gameId: number, requestingUserId?: number) {
    const game = await this.gameModel.findByPk(gameId, {
      include: [Player, Room],
    });

    if (!game) throw new NotFoundException('Game not found');

    if (requestingUserId != null && game.room.hostId !== requestingUserId) {
      throw new ForbiddenException('Somente o anfitri\u00e3o pode iniciar o jogo');
    }

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
    await this.roomModel.update(
      { status: 'PLAYING' },
      { where: { id: game.roomId } },
    );
    clearPhaseExpiration(game.id);
    await this.notifyGameUpdated(game.id);

    return game;
  }

  async advancePhase(gameId: number, requestingUserId?: number) {
    const game = await this.gameModel.findByPk(gameId, {
      include: [Room],
    });

    if (!game) throw new NotFoundException('Game not found');

    if (requestingUserId != null && game.room.hostId !== requestingUserId) {
      throw new ForbiddenException('Somente o anfitriao pode avancar a fase');
    }

    if (game.finishedAt) {
      throw new BadRequestException('Game already finished');
    }

    if (game.status === 'WAITING') {
      throw new BadRequestException('Game has not started');
    }

    this.nextPhase(game);
    await game.save();
    this.schedulePhaseTimeout(game);
    await this.notifyGameUpdated(game.id);
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

  async vote(gameId: number, voterId: number, targetId?: number | null) {
    const game = await this.gameModel.findByPk(gameId);

    if (!game) throw new NotFoundException('Game not found');

    if (hasPhaseExpired(gameId)) {
      throw new BadRequestException(
        'Tempo de votacao expirou; rodada ignorada.',
      );
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

    let target: Player | null = null;

    if (targetId != null) {
      target = await this.playerModel.findByPk(targetId);

      if (!target || target.gameId !== gameId) {
        throw new BadRequestException('Invalid target');
      }

      if (!target.isAlive) {
        throw new BadRequestException('Cannot vote on dead player');
      }

      if (target.id === player.id) {
        throw new BadRequestException('Player cannot vote on themselves');
      }
    }

    const existingVote = await this.voteModel.findOne({
      where: { gameId, voterId: player.id, roundNumber: game.roundNumber },
    });

    if (existingVote) {
      throw new BadRequestException('Player already voted');
    }

    await this.voteModel.create({
      gameId,
      voterId: player.id,
      targetPlayerId: target?.id ?? null,
      roundNumber: game.roundNumber,
    });

    const result = await this.checkAllVoted(gameId);
    await this.notifyGameUpdated(gameId);
    return result;
  }

  async checkAllVoted(gameId: number) {
    const game = await this.gameModel.findByPk(gameId);

    if (!game) throw new NotFoundException('Game not found');

    const alivePlayers = await this.playerModel.findAll({
      where: { gameId, isAlive: true },
    });

    const votes = await this.voteModel.findAll({
      where: { gameId, roundNumber: game.roundNumber },
    });

    if (votes.length >= alivePlayers.length) {
      return this.resolveVoting(gameId);
    }

    return { message: 'Vote registered' };
  }

  async schedulePhaseTimeout(game: Game) {
    clearPhaseExpiration(game.id);

    if (game.status !== 'DISCUSSING' && game.status !== 'VOTING') {
      return;
    }

    const phaseDuration = game.status === 'DISCUSSING' ? 30000 : 15000;

    const timer = setTimeout(async () => {
      const currentGame = await this.gameModel.findByPk(game.id, {
        include: [Player],
      });

      if (!currentGame || currentGame.finishedAt) {
        return;
      }

      if (currentGame.status === 'DISCUSSING') {
        this.nextPhase(currentGame);
        await currentGame.save();
        this.schedulePhaseTimeout(currentGame);
        await this.notifyGameUpdated(currentGame.id);
        return;
      }

      if (currentGame.status === 'VOTING') {
        await this.resolveVoting(currentGame.id);
        await this.notifyGameUpdated(currentGame.id);
      }
    }, phaseDuration);

    setPhaseExpiration(game.id, Date.now() + phaseDuration, timer);
  }

  async getGameState(gameId: number, userId: number) {
    const game = await this.gameModel.findByPk(gameId, {
      include: [{ model: Player, include: [Word, User] }],
    });

    if (!game) throw new NotFoundException('Game not found');

    const me = game.players.find((p) => p.userId === userId);

    if (!me) {
      throw new ForbiddenException('Usuario nao participa deste jogo');
    }

    const alivePlayers = game.players.filter((p) => p.isAlive);
    const [clueCount, voteCount, votes] = await Promise.all([
      this.clueModel.count({
        where: { gameId, roundNumber: game.roundNumber },
      }),
      this.voteModel.count({
        where: { gameId, roundNumber: game.roundNumber },
      }),
      this.voteModel.findAll({
        where: { gameId, roundNumber: game.roundNumber },
      }),
    ]);

    const votesByTarget = votes.reduce<Record<number, number>>((acc, vote) => {
      if (vote.targetPlayerId == null) return acc;
      acc[vote.targetPlayerId] = (acc[vote.targetPlayerId] || 0) + 1;
      return acc;
    }, {});

    return {
      status: game.status,
      round: game.roundNumber,
      finishedAt: game.finishedAt,
      winner: game.finishedAt ? game.winner : null,
      aliveCount: alivePlayers.length,
      clueCount,
      voteCount,

      players: game.players.map((p) => ({
        id: p.id,
        userId: p.userId,
        name: p.user?.name,
        isAlive: p.isAlive,
        voteCount: votesByTarget[p.id] || 0,
      })),

      myRole: game.status === 'WAITING' && !game.finishedAt ? null : me?.role || null,
      myPlayerId: me?.id || null,
      myWord:
        game.status === 'WAITING'
          ? null
          : me?.role === 'IMPOSTOR'
            ? me.word?.impostorClue || null
            : me?.word?.word || null,
    };
  }

  async resolveVoting(gameId: number) {
    const game = await this.gameModel.findByPk(gameId);

    if (!game) throw new NotFoundException('Game not found');

    const votes = await this.voteModel.findAll({
      where: { gameId, roundNumber: game.roundNumber },
    });

    if (votes.length === 0) {
      return this.checkWin(gameId);
    }

    const count: Record<number, number> = {};

    for (const vote of votes) {
      if (vote.targetPlayerId == null) continue;
      count[vote.targetPlayerId] = (count[vote.targetPlayerId] || 0) + 1;
    }

    if (Object.keys(count).length === 0) {
      return this.checkWin(gameId);
    }

    const maxVotes = Math.max(...Object.values(count));
    const tiedPlayers = Object.keys(count).filter(
      (id) => count[Number(id)] === maxVotes,
    );

    if (tiedPlayers.length > 1) {
      await this.voteModel.destroy({
        where: { gameId, roundNumber: game.roundNumber },
      });

      this.nextPhase(game);
      await game.save();
      clearPhaseExpiration(game.id);

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
      where: { gameId, roundNumber: game.roundNumber },
    });

    return this.checkWin(gameId);
  }

  async checkWin(gameId: number) {
    const players = await this.playerModel.findAll({
      where: { gameId },
    });

    const alive = players.filter((p) => p.isAlive);

    const impostors = alive.filter((p) => p.role === 'IMPOSTOR').length;

    const innocents = alive.filter((p) => p.role === 'INNOCENT').length;

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
    clearPhaseExpiration(game.id);

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
    await this.roomModel.update(
      { status: 'WAITING' },
      { where: { id: game.roomId } },
    );

    return game;
  }
}
