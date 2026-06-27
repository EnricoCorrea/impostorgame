import { apiRequest, queryString } from "@/data/http-client";
import type { Clue, Page } from "@/types/api";

export interface CluePayload {
  gameId: number;
  playerId: number;
  roundNumber: number;
  clue: string;
}

export const cluesService = {
  list: (filters: { game_id?: number; clue?: string; page?: number; limit?: number }) =>
    apiRequest<Page<Clue>>(`/clues${queryString(filters)}`),
  get: (id: number) => apiRequest<Clue>(`/clues/${id}`),
  create: (data: CluePayload) => apiRequest<Clue>("/clues", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<CluePayload>) =>
    apiRequest<Clue>(`/clues/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => apiRequest<Clue>(`/clues/${id}`, { method: "DELETE" }),
};
