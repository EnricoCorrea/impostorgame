"use client";

import { useState, type FormEvent } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { playersService, type PlayerPayload } from "@/services/players.service";
import type { Player, PlayerRole } from "@/types/api";

export function PlayerForm({ player, onSaved }: { player?: Player; onSaved: () => void }) {
  const [gameId, setGameId] = useState(player?.gameId ? String(player.gameId) : "");
  const [userId, setUserId] = useState(player?.userId ? String(player.userId) : "");
  const [wordId, setWordId] = useState(player?.wordId ? String(player.wordId) : "");
  const [role, setRole] = useState<PlayerRole>(player?.role ?? "INNOCENT");
  const [isAlive, setIsAlive] = useState(player?.isAlive ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!gameId || !userId || !wordId) return setError("Preencha os IDs da partida, usuario e palavra.");

    setLoading(true);
    try {
      const data: PlayerPayload = {
        gameId: Number(gameId),
        userId: Number(userId),
        wordId: Number(wordId),
        role,
        isAlive,
      };
      if (player) await playersService.update(player.id, data);
      else await playersService.create(data);
      if (!player) {
        setUserId("");
        setWordId("");
        setRole("INNOCENT");
        setIsAlive(true);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar jogador.");
    } finally {
      setLoading(false);
    }
  }

  const cleanNumber = (value: string) => value.replace(/\D/g, "");

  return (
    <form className={player ? "stack" : "form-card"} onSubmit={submit} noValidate>
      {!player && (
        <div>
          <span className="eyebrow">Cadastro de jogador</span>
          <h2>Novo jogador</h2>
          <p>Associe um usuario, uma partida e uma palavra ao papel do jogador.</p>
        </div>
      )}
      <label>ID da partida<input value={gameId} onChange={(event) => setGameId(cleanNumber(event.target.value))} placeholder="Ex.: 1" /></label>
      <label>ID do usuario<input value={userId} onChange={(event) => setUserId(cleanNumber(event.target.value))} placeholder="Ex.: 2" /></label>
      <label>ID da palavra<input value={wordId} onChange={(event) => setWordId(cleanNumber(event.target.value))} placeholder="Ex.: 3" /></label>
      <label>Papel<select value={role} onChange={(event) => setRole(event.target.value as PlayerRole)}><option value="INNOCENT">INNOCENT</option><option value="IMPOSTOR">IMPOSTOR</option></select></label>
      <label>Status<select value={isAlive ? "alive" : "out"} onChange={(event) => setIsAlive(event.target.value === "alive")}><option value="alive">Vivo</option><option value="out">Eliminado</option></select></label>
      {error && <p className="form-error">{error}</p>}
      <ActionButton type="submit" loading={loading}>{player ? "Salvar jogador" : "Cadastrar jogador"}</ActionButton>
    </form>
  );
}
