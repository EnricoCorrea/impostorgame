import { apiRequest, queryString } from "@/data/http-client";
import type { Message, Page } from "@/types/api";

export const messagesService = {
  list: (filters: { game_id?: number; player_id?: number; page?: number; limit?: number }) =>
    apiRequest<Page<Message>>(`/messages${queryString(filters)}`),
  create: (data: { gameId: number; playerId: number; content: string }) =>
    apiRequest<Message>("/messages", { method: "POST", body: JSON.stringify(data) }),
};
