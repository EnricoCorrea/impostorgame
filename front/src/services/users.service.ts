import { apiRequest, queryString } from "@/data/http-client";
import type { Page, User } from "@/types/api";

export interface UserInput { name: string; email: string; password?: string }

export const usersService = {
  list: (filters: { name?: string; email?: string; page?: number; limit?: number }) =>
    apiRequest<Page<User>>(`/users${queryString(filters)}`),
  get: (id: number) => apiRequest<User>(`/users/${id}`),
  create: (data: Required<UserInput>) => apiRequest<User>("/users", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: UserInput) => apiRequest<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => apiRequest<User>(`/users/${id}`, { method: "DELETE" }),
};
