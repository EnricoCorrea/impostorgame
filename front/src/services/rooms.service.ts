import { apiRequest, queryString } from "@/data/http-client";
import type { Page, Room } from "@/types/api";

export const roomsService = {
  list: (filters: { name?: string; host_id?: number; page?: number; limit?: number }) =>
    apiRequest<Page<Room>>(`/rooms${queryString(filters)}`),
  get: (id: number) => apiRequest<Room>(`/rooms/${id}`),
  create: (data: { name: string; maxUsers: number }) => apiRequest<Room>("/rooms", { method: "POST", body: JSON.stringify(data) }),
  join: (id: number) => apiRequest(`/rooms/${id}/join`, { method: "POST" }),
  leave: (id: number) => apiRequest(`/rooms/${id}/leave`, { method: "POST" }),
  remove: (id: number) => apiRequest<Room>(`/rooms/${id}`, { method: "DELETE" }),
};
