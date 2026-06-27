import { io, type Socket } from "socket.io-client";
import type { LiveGameUpdate } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type LiveSocketStatus = "connecting" | "connected" | "disconnected" | "error";
export type LiveSocketEvent = "game_updated" | "message";

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
  const socket: Socket = io(API_URL, { transports: ["websocket"] });

  socket.on("connect", () => onStatus("connected"));
  socket.on("disconnect", () => onStatus("disconnected"));
  socket.on("connect_error", (error) => {
    onStatus("error");
    onMessage({ event: "message", message: error.message });
  });
  socket.on("game_updated", (data: LiveGameUpdate) => onMessage({ event: "game_updated", data }));

  return {
    send: (event: string, data: Record<string, unknown>) => socket.emit(event, data),
    close: () => socket.disconnect(),
  };
}
