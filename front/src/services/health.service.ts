import type { HealthStatus } from "@/types/api";
import { getApiBaseUrl } from "@/data/api-config";

export const healthService = {
  async check(): Promise<HealthStatus> {
    const response = await fetch(getApiBaseUrl());
    if (!response.ok) throw new Error("API indisponivel");
    return { status: "API conectada", timestamp: new Date().toISOString() };
  },
};
