import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth/auth.service';
import { GamesService } from './games/games.service';
import { RoomsService } from './rooms/rooms.service';

describe('Regras críticas do Impostor Game', () => {
  describe('RoomsService', () => {
    it('define anfitrião/status e inclui o anfitrião na sala', async () => {
      const roomModel = { create: jest.fn().mockResolvedValue({ id: 7 }) };
      const roomUserModel = { create: jest.fn().mockResolvedValue({}) };
      const sequelize = {
        transaction: jest.fn((callback) => callback('transaction')),
      };
      const service = new RoomsService(
        roomModel as any,
        roomUserModel as any,
        {} as any,
        {} as any,
        sequelize as any,
      );

      await service.create({ name: 'Sala teste', maxUsers: 5 }, 42);

      expect(roomModel.create).toHaveBeenCalledWith(
        {
          name: 'Sala teste',
          maxUsers: 5,
          hostId: 42,
          status: 'WAITING',
        },
        { transaction: 'transaction' },
      );
      expect(roomUserModel.create).toHaveBeenCalledWith(
        { roomId: 7, userId: 42 },
        { transaction: 'transaction' },
      );
    });

    it('recusa entrada quando a sala está cheia', async () => {
      const roomUserModel = { count: jest.fn().mockResolvedValue(3) };
      const gameModel = { findOne: jest.fn().mockResolvedValue(null) };
      const service = new RoomsService(
        { findByPk: jest.fn().mockResolvedValue({ maxUsers: 3 }) } as any,
        roomUserModel as any,
        gameModel as any,
        {} as any,
        {} as any,
      );

      await expect(service.joinRoom(1, 9)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(gameModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['startedAt', 'DESC']] }),
      );
    });
  });

  describe('GamesService', () => {
    const makeService = (overrides: Record<string, any> = {}) => {
      const models = {
        game: {
          findOne: jest.fn(),
          findByPk: jest.fn(),
          create: jest.fn(),
          ...overrides.game,
        },
        player: {
          create: jest.fn(),
          findOne: jest.fn(),
          findByPk: jest.fn(),
          ...overrides.player,
        },
        vote: {
          findOne: jest.fn(),
          create: jest.fn(),
          destroy: jest.fn(),
          ...overrides.vote,
        },
        room: { findByPk: jest.fn(), update: jest.fn(), ...overrides.room },
        word: { findAll: jest.fn(), ...overrides.word },
        gameWord: { create: jest.fn(), ...overrides.gameWord },
      };
      return {
        service: new GamesService(
          models.game as any,
          models.player as any,
          models.vote as any,
          models.room as any,
          models.word as any,
          models.gameWord as any,
        ),
        models,
      };
    };

    it('retorna 400 ao criar jogo com menos de 3 usuários', async () => {
      const { service } = makeService({
        game: { findOne: jest.fn().mockResolvedValue(null) },
        room: {
          findByPk: jest
            .fn()
            .mockResolvedValue({ hostId: 1, users: [{ id: 1 }, { id: 2 }] }),
        },
      });

      await expect(service.createGame(5, 1)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('impede outro usuário de criar o jogo da sala', async () => {
      const { service } = makeService({
        game: { findOne: jest.fn().mockResolvedValue(null) },
        room: {
          findByPk: jest
            .fn()
            .mockResolvedValue({ hostId: 1, users: [{}, {}, {}] }),
        },
      });

      await expect(service.createGame(5, 99)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('salva voto com playerId e roundNumber, não com userId', async () => {
      const { service, models } = makeService({
        game: {
          findByPk: jest
            .fn()
            .mockResolvedValue({ id: 8, status: 'VOTING', roundNumber: 2 }),
        },
        player: {
          findOne: jest.fn().mockResolvedValue({ id: 31, isAlive: true }),
          findByPk: jest
            .fn()
            .mockResolvedValue({ id: 40, gameId: 8, isAlive: true }),
          findAll: jest.fn().mockResolvedValue([
            { id: 31, isAlive: true },
            { id: 40, isAlive: true },
          ]),
        },
        vote: {
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
          findAll: jest.fn().mockResolvedValue([]),
        },
      });

      await service.vote(8, 12, 40);
      expect(models.vote.create).toHaveBeenCalledWith({
        gameId: 8,
        voterId: 31,
        targetPlayerId: 40,
        roundNumber: 2,
      });
    });
  });

  describe('AuthService', () => {
    it('retorna 401 para senha incorreta', async () => {
      const hash = await bcrypt.hash('senha-correta', 4);
      const service = new AuthService(
        { findByEmail: jest.fn().mockResolvedValue({ password: hash }) } as any,
        {} as any,
      );

      await expect(
        service.validateUser('teste@email.com', 'senha-errada'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
