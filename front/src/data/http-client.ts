import type { ApiErrorBody } from "@/types/api";
import { getApiBaseUrl } from "@/data/api-config";

const TOKEN_KEY = "impostor-game-token";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function readErrorMessage(response: Response) {
  const text = await response.text().catch(() => "");

  if (response.status === 401) {
    tokenStore.clear();
    return "Erro, tente novamente. Senha ou email incorreto.";
  }

  if (!text) return "Nao foi possivel concluir a operacao";

  try {
    const body = JSON.parse(text) as ApiErrorBody;
    return Array.isArray(body?.message)
      ? body.message.join(". ")
      : body?.message ?? text;
  } catch {
    return text.length > 180 ? text.slice(0, 180) : text;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export function queryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}
