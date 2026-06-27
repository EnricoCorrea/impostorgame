import type { HealthStatus } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const healthService = {
  async check(): Promise<HealthStatus> {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API indisponivel");
    return { status: "API conectada", timestamp: new Date().toISOString() };
  },
};