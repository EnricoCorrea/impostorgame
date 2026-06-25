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

export interface PlayerState {
  id: number;
  userId: number;
  isAlive: boolean;
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
  players: PlayerState[];
  myRole: "IMPOSTOR" | "INNOCENT" | null;
}

export interface Word {
  id: number;
  word: string;
  impostorClue: string;
}

export interface Page<T> {
  data: T[];
  meta: { total: number; page: number; lastPage: number };
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
}
