import { EventEmitter } from 'events';

export const gameEvents = new EventEmitter();

export type GameTimeoutPayload = {
  gameId: number;
  roomId: number;
  phase: 'CLUE' | 'VOTING';
};

export type GameUpdatedPayload = {
  gameId: number;
  roomId: number;
  game: unknown;
};
