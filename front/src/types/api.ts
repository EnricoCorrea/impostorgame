export type Role = "ADMIN" | "PLAYER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface Room {
  id: number;
  name: string;
  hostId: number;
  status: "WAITING" | "PLAYING" | "CLOSED";
  maxUsers: number;
  createdAt?: string;
  users?: User[];
  host?: User;
}

export type GameStatus = "WAITING" | "CLUE" | "DISCUSSING" | "VOTING";

export interface Clue {
  id: number;
  gameId: number;
  playerId: number;
  roundNumber: number;
  clue: string;
  createdAt?: string;
  game?: Game;
  player?: Player;
}

export interface PlayerState {
  id: number;
  userId: number;
  name?: string;
  isAlive: boolean;
  voteCount?: number;
}

export type PlayerRole = "IMPOSTOR" | "INNOCENT";

export interface Player {
  id: number;
  gameId: number;
  userId: number;
  wordId: number;
  role: PlayerRole;
  isAlive: boolean;
  game?: Game;
  user?: User;
  word?: Word;
}

export interface Game {
  id: number;
  roomId: number;
  status: GameStatus;
  roundNumber: number;
  winner?: "IMPOSTOR" | "INNOCENT" | null;
  startedAt?: string;
  finishedAt?: string | null;
  room?: Room;
}

export interface GamePrivateState {
  status: GameStatus;
  round: number;
  finishedAt?: string | null;
  winner?: "IMPOSTOR" | "INNOCENT" | null;
  phaseEndsAt?: string | null;
  players: PlayerState[];
  aliveCount?: number;
  clueCount?: number;
  voteCount?: number;
  myRole: "IMPOSTOR" | "INNOCENT" | null;
  myPlayerId?: number | null;
  myWord?: string | null;
}

export interface Word {
  id: number;
  word: string;
  impostorClue: string;
}

export interface Message {
  id: number;
  gameId: number;
  playerId: number;
  content: string;
  createdAt?: string;
  game?: Game;
  player?: Player;
}

export interface Vote {
  gameId: number;
  voterId: number;
  targetPlayerId: number | null;
  roundNumber: number;
  createdAt?: string;
  game?: Game;
  voter?: PlayerState;
  target?: PlayerState;
}

export interface VoteScore {
  targetId: number;
  votes: number;
}

export interface HealthStatus {
  status: string;
  uptime?: number;
  timestamp?: string;
}

export interface LiveGameUpdate {
  gameId?: number;
  roomId?: number;
  status?: GameStatus;
  roundNumber?: number;
  phaseEndsAt?: string;
  winner?: "IMPOSTOR" | "INNOCENT" | null;
  scores?: VoteScore[];
  message?: string;
}

export interface Page<T> {
  data: T[];
  meta: { total: number; page: number; lastPage: number };
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
}
