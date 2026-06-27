import { apiRequest, queryString } from "@/data/http-client";
import type { Page, Vote } from "@/types/api";

export type VoteFilters = Record<string, string | number | undefined> & {
  game_id?: number;
  voter_id?: number;
  target_player_id?: number;
  page?: number;
  limit?: number;
};

export interface VotePayload {
  gameId: number;
  voterId: number;
  targetPlayerId: number;
  roundNumber: number;
}

export const votesService = {
  list: (filters: VoteFilters) => apiRequest<Page<Vote>>(`/votes${queryString(filters)}`),
  get: (roundNumber: number, gameId: number, voterId: number) => apiRequest<Vote>(`/votes/${roundNumber}/${gameId}/${voterId}`),
  create: (data: VotePayload) => apiRequest<Vote>("/votes", { method: "POST", body: JSON.stringify(data) }),
  update: (roundNumber: number, gameId: number, voterId: number, data: Partial<VotePayload>) =>
    apiRequest<Vote>(`/votes/${roundNumber}/${gameId}/${voterId}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (roundNumber: number, gameId: number, voterId: number) =>
    apiRequest<Vote>(`/votes/${roundNumber}/${gameId}/${voterId}`, { method: "DELETE" }),
};
