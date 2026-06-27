"use client";

import { useState } from "react";
import { gamesService } from "@/services/games.service";
import { ActionButton } from "@/components/ui/action-button";

export function VoteButton({ gameId, targetId, onVoted }: { gameId: number; targetId: number; onVoted: (message: string) => void }) {
  const [loading, setLoading] = useState(false);

  async function vote() {
    setLoading(true);
    try {
      await gamesService.vote(gameId, targetId);
      onVoted("Voto enviado.");
    } catch (err) {
      onVoted(err instanceof Error ? err.message : "Nao foi possivel votar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ActionButton variant="secondary" loading={loading} onClick={vote}>
      Votar
    </ActionButton>
  );
}
