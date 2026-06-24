import { apiRequest, tokenStore } from "@/data/http-client";
import type { User } from "@/types/api";

export const authService = {
  async login(email: string, password: string) {
    const result = await apiRequest<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    tokenStore.set(result.access_token);
    return result;
  },
  me: () => apiRequest<User>("/users/me"),
  logout: () => tokenStore.clear(),
  hasToken: () => Boolean(tokenStore.get()),
};
