import { apiRequest, queryString } from "@/data/http-client";
import type { Page, Word } from "@/types/api";

export const wordsService = {
  list: (filters: { word?: string; impostorClue?: string; page?: number; limit?: number }) =>
    apiRequest<Page<Word>>(`/words${queryString(filters)}`),
  get: (id: number) => apiRequest<Word>(`/words/${id}`),
  create: (data: Pick<Word, "word" | "impostorClue">) =>
    apiRequest<Word>("/words", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Pick<Word, "word" | "impostorClue">>) =>
    apiRequest<Word>(`/words/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => apiRequest<Word>(`/words/${id}`, { method: "DELETE" }),
};
