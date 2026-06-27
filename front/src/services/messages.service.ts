import { apiRequest, queryString } from "@/data/http-client";
import type { Message, Page } from "@/types/api";

export interface MessagePayload {
  gameId: number;
  playerId: number;
  content: string;
}

export const messagesService = {
  list: (filters: { game_id?: number; player_id?: number; page?: number; limit?: number }) =>
    apiRequest<Page<Message>>(`/messages${queryString(filters)}`),
  get: (id: number) => apiRequest<Message>(`/messages/${id}`),
  create: (data: MessagePayload) => apiRequest<Message>("/messages", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<MessagePayload>) =>
    apiRequest<Message>(`/messages/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => apiRequest<Message>(`/messages/${id}`, { method: "DELETE" }),
};
