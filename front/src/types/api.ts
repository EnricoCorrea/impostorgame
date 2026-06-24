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

export interface Page<T> {
  data: T[];
  meta: { total: number; page: number; lastPage: number };
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
}
