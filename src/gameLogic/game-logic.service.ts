import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Game } from 'src/games/entities/game.entity';
import { Player } from 'src/players/entities/player.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { User } from 'src/users/entities/user.entity';
import { Word } from 'src/words/entities/word.entity';
import { Vote } from 'src/votes/entities/vote.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Clue } from 'src/clues/entities/clue.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game) private gameModel: typeof Game,
    @InjectModel(Player) private playerModel: typeof Player,
    @InjectModel(Room) private roomModel: typeof Room,
    @InjectModel(User) private UserModel: typeof User,
    @InjectModel(Word) private wordModel: typeof Word,
    @InjectModel(Vote) private voteModel: typeof Vote,
    @InjectModel(Message) private messageModel: typeof Message,
    @InjectModel(Clue) private clueModel: typeof Clue,
  ) {}

  async startGame(roomId: number, userId: number) {
    const room = await this.roomModel.findByPk(roomId);

    if (!room) throw new NotFoundException('Room not found');

    if (room.status !== 'WAITING') {
      throw new BadRequestException('Game already started');
    }

    const roomUsers = await this.roomModel.findByPk(roomId, {
        include: [User],
    });

    if (!roomUsers) throw new NotFoundException('Users not found in Room');

    const users = roomUsers.users;

    if (users.length < 3) {
      throw new BadRequestException('Minimum 3 players required');
    }

    const game = await this.gameModel.create({
      room_id: roomId,
      status: 'CLUE',
      started_at: new Date(),
    });

    await this.createPlayers(game.id, users);
    await this.assignRoles(game.id);
    await this.assignWord(game.id);

    await room.update({ status: 'PLAYING' });

    return game;
  }

  async createPlayers(gameId: number, users: any[]) {
    for (const u of users) {
      await this.playerModel.create({
        game_id: gameId,
        user_id: u.user_id,
        eliminated: false,
      });
    }
  }

  async assignRoles(gameId: number) {
    const players = await this.playerModel.findAll({
      where: { game_id: gameId },
    });

    const randomIndex = Math.floor(Math.random() * players.length);

    for (let i = 0; i < players.length; i++) {
      await players[i].update({
        role: i === randomIndex ? 'IMPOSTOR' : 'INNOCENT',
      });
    }
  }

  async assignWord(gameId: number) {
    const words = await this.wordModel.findAll();
    const randomWord = words[Math.floor(Math.random() * words.length)];

    const players = await this.playerModel.findAll({
      where: { game_id: gameId },
    });

    for (const player of players) {
      if (player.role === 'INNOCENT') {
        await player.update({ word_id: randomWord.id });
      }
    }
  }

  async nextPhase(gameId: number) {
    const game = await this.gameModel.findByPk(gameId);
    if (!game) throw new NotFoundException('Game not found');

    if (game.status === 'CLUE') game.status = 'DISCUSSING';
    else if (game.status === 'DISCUSSING') game.status = 'VOTING';
    else if (game.status === 'VOTING') game.status = 'CLUE';

    await game.save();

    return game;
  }

  async sendClue(gameId: number, userId: number, content: string) {
    const game = await this.gameModel.findByPk(gameId);

    if (!game) throw new NotFoundException('Game not found');

    if (game.status !== 'CLUE') {
      throw new BadRequestException('Not clue phase');
    }

    const player = await this.playerModel.findOne({
      where: { game_id: gameId, user_id: userId },
    });

    if (!player) throw new NotFoundException('Player not found');

    return this.clueModel.create({
      game_id: gameId,
      player_id: player.id,
      content,
    });
  }

  async sendMessage(gameId: number, userId: number, content: string) {
    const game = await this.gameModel.findByPk(gameId);

    if (!game) throw new NotFoundException('Game not found');
    
    if (game.status !== 'DISCUSSING') {
      throw new BadRequestException('Not discussion phase');
    }

    const player = await this.playerModel.findOne({
      where: { game_id: gameId, user_id: userId },
    });

    if (!player) throw new NotFoundException('Player not found');

    return this.messageModel.create({
      game_id: gameId,
      player_id: player.id,
      content,
    });
  }

  async vote(gameId: number, userId: number, votedPlayerId: number | null) {
    const game = await this.gameModel.findByPk(gameId);

    if (!game) throw new NotFoundException('Game not found');

    if (game.status !== 'VOTING') {
      throw new BadRequestException('Not voting phase');
    }

    const player = await this.playerModel.findOne({
      where: { game_id: gameId, user_id: userId },
    });

    if (!player) throw new NotFoundException('Player not found');
    
    const existingVote = await this.voteModel.findOne({
      where: { player_id: player.id, game_id: gameId },
    });

    if (existingVote) {
      throw new BadRequestException('Already voted');
    }

    return this.voteModel.create({
      game_id: gameId,
      player_id: player.id,
      voted_player_id: votedPlayerId,
    });
  }

  async checkWin(gameId: number) {
    const players = await this.playerModel.findAll({
      where: { game_id: gameId },
    });

    const alive = players.filter((p) => p.isAlive);

    const impostor = alive.find((p) => p.role === 'IMPOSTOR');

    if (!impostor) return 'INNOCENTS_WIN';

    if (alive.length <= 2) return 'IMPOSTOR_WIN';

    return null;
  }

  async getGameState(gameId: number) {
    const game = await this.gameModel.findByPk(gameId);

    const players = await this.playerModel.findAll({
      where: { game_id: gameId },
    });

    return {
      game,
      players,
    };
  }
}
