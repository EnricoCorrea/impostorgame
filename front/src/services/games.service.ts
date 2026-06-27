import { apiRequest, queryString } from "@/data/http-client";
import type { Game, GamePrivateState, Page } from "@/types/api";

export const gamesService = {
  list: (filters: { room_id?: number; round_number?: number; page?: number; limit?: number }) =>
    apiRequest<Page<Game>>(`/games${queryString(filters)}`),
  get: (id: number) => apiRequest<Game>(`/games/${id}`),
  create: (roomId: number) => apiRequest<Game>(`/games/room/${roomId}`, { method: "POST" }),
  start: (id: number) => apiRequest<Game>(`/games/${id}/start`, { method: "POST" }),
  nextPhase: (id: number) => apiRequest<Game>(`/games/${id}/next-phase`, { method: "POST" }),
  state: (id: number) => apiRequest<GamePrivateState>(`/games/${id}/state`),
  vote: (id: number, targetId?: number) =>
    apiRequest(`/games/${id}/vote`, { method: "POST", body: JSON.stringify(targetId ? { targetId } : {}) }),
  update: (id: number, data: Partial<Pick<Game, "roomId" | "status">>) =>
    apiRequest<Game>(`/games/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => apiRequest<Game>(`/games/${id}`, { method: "DELETE" }),
};
