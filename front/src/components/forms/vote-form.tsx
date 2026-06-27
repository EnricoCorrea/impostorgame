"use client";

import { useState, type FormEvent } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { votesService, type VotePayload } from "@/services/votes.service";
import type { Vote } from "@/types/api";

export function VoteForm({ vote, onSaved }: { vote?: Vote; onSaved: () => void }) {
  const [gameId, setGameId] = useState(vote?.gameId ? String(vote.gameId) : "");
  const [voterId, setVoterId] = useState(vote?.voterId ? String(vote.voterId) : "");
  const [targetPlayerId, setTargetPlayerId] = useState(vote?.targetPlayerId ? String(vote.targetPlayerId) : "");
  const [roundNumber, setRoundNumber] = useState(vote?.roundNumber ? String(vote.roundNumber) : "1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!gameId || !voterId || !targetPlayerId || !roundNumber) return setError("Preencha todos os IDs e a rodada.");
    if (voterId === targetPlayerId) return setError("O votante e o alvo precisam ser jogadores diferentes.");

    setLoading(true);
    try {
      const data: VotePayload = {
        gameId: Number(gameId),
        voterId: Number(voterId),
        targetPlayerId: Number(targetPlayerId),
        roundNumber: Number(roundNumber),
      };
      if (vote) await votesService.update(vote.roundNumber, vote.gameId, vote.voterId, data);
      else await votesService.create(data);
      if (!vote) {
        setVoterId("");
        setTargetPlayerId("");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar voto.");
    } finally {
      setLoading(false);
    }
  }

  const cleanNumber = (value: string) => value.replace(/\D/g, "");

  return (
    <form className={vote ? "stack" : "form-card"} onSubmit={submit} noValidate>
      {!vote && (
        <div>
          <span className="eyebrow">Voto administrativo</span>
          <h2>Cadastrar voto</h2>
          <p>Registre um voto manualmente para auditoria ou ajuste de rodada.</p>
        </div>
      )}
      <label>ID da partida<input value={gameId} onChange={(event) => setGameId(cleanNumber(event.target.value))} placeholder="Ex.: 1" /></label>
      <label>ID do votante<input value={voterId} onChange={(event) => setVoterId(cleanNumber(event.target.value))} placeholder="Ex.: 2" /></label>
      <label>ID do alvo<input value={targetPlayerId} onChange={(event) => setTargetPlayerId(cleanNumber(event.target.value))} placeholder="Ex.: 3" /></label>
      <label>Rodada<input value={roundNumber} onChange={(event) => setRoundNumber(cleanNumber(event.target.value))} placeholder="Ex.: 1" /></label>
      {error && <p className="form-error">{error}</p>}
      <ActionButton type="submit" loading={loading}>{vote ? "Salvar voto" : "Cadastrar voto"}</ActionButton>
    </form>
  );
}
