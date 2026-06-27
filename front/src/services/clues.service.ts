import { apiRequest, queryString } from "@/data/http-client";
import type { Clue, Page } from "@/types/api";

export const cluesService = {
  list: (filters: { game_id?: number; clue?: string; page?: number; limit?: number }) =>
    apiRequest<Page<Clue>>(`/clues${queryString(filters)}`),
  create: (data: { gameId: number; playerId: number; roundNumber: number; clue: string }) =>
    apiRequest<Clue>("/clues", { method: "POST", body: JSON.stringify(data) }),
};
