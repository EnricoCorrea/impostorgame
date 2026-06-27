import { io, type Socket } from "socket.io-client";
import { getSocketBaseUrl } from "@/data/api-config";
import type { LiveGameUpdate } from "@/types/api";

export type LiveSocketStatus = "connecting" | "connected" | "disconnected" | "error";
export type LiveSocketEvent = "game_updated" | "live_error" | "message";

export interface LiveSocketMessage {
  event?: LiveSocketEvent | string;
  data?: LiveGameUpdate;
  message?: string;
}

export function createLiveGameSocket({
  onStatus,
  onMessage,
}: {
  onStatus: (status: LiveSocketStatus) => void;
  onMessage: (message: LiveSocketMessage) => void;
}) {
  onStatus("connecting");
  const socket: Socket = io(getSocketBaseUrl(), { transports: ["websocket"] });

  socket.on("connect", () => onStatus("connected"));
  socket.on("disconnect", () => onStatus("disconnected"));
  socket.on("connect_error", (error) => {
    onStatus("error");
    onMessage({ event: "message", message: error.message });
  });
  socket.on("game_updated", (data: LiveGameUpdate) => onMessage({ event: "game_updated", data }));
  socket.on("live_error", (data: { message?: string }) => onMessage({ event: "live_error", message: data.message ?? "Acao nao concluida." }));

  return {
    send: (event: string, data: Record<string, unknown>) => socket.emit(event, data),
    close: () => socket.disconnect(),
  };
}
