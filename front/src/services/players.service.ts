import { apiRequest, queryString } from "@/data/http-client";
import type { Page, Player, PlayerRole } from "@/types/api";

export type PlayerFilters = Record<string, string | number | undefined> & {
  game_id?: number;
  user_id?: number;
  word_id?: number;
  page?: number;
  limit?: number;
};

export interface PlayerPayload {
  gameId: number;
  userId: number;
  wordId: number;
  role: PlayerRole;
  isAlive: boolean;
}

export const playersService = {
  list: (filters: PlayerFilters) => apiRequest<Page<Player>>(`/players${queryString(filters)}`),
  get: (id: number) => apiRequest<Player>(`/players/${id}`),
  create: (data: PlayerPayload) => apiRequest<Player>("/players", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<PlayerPayload>) =>
    apiRequest<Player>(`/players/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => apiRequest<Player>(`/players/${id}`, { method: "DELETE" }),
};
