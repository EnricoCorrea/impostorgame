"use client";

import { useState } from "react";
import { gamesService } from "@/services/games.service";
import { ActionButton } from "@/components/ui/action-button";

export function StartGameButton({ gameId, onStarted }: { gameId: number; onStarted: (message: string) => void }) {
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      await gamesService.start(gameId);
      onStarted("Partida iniciada.");
    } catch (err) {
      onStarted(err instanceof Error ? err.message : "Nao foi possivel iniciar a partida.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ActionButton variant="secondary" loading={loading} onClick={start}>
      Iniciar
    </ActionButton>
  );
}
