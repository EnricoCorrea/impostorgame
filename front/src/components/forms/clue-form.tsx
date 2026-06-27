"use client";

import { useState, type FormEvent } from "react";
import { SendClueButton } from "@/components/ui/send-clue-button";
import { cluesService, type CluePayload } from "@/services/clues.service";
import type { Clue } from "@/types/api";

export function ClueForm({ clue, onSaved }: { clue?: Clue; onSaved: () => void }) {
  const [gameId, setGameId] = useState(clue?.gameId ? String(clue.gameId) : "");
  const [playerId, setPlayerId] = useState(clue?.playerId ? String(clue.playerId) : "");
  const [roundNumber, setRoundNumber] = useState(clue?.roundNumber ? String(clue.roundNumber) : "1");
  const [text, setText] = useState(clue?.clue ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const cleanText = text.trim();
    if (!gameId || !playerId || !roundNumber) return setError("Preencha a partida, o jogador e a rodada.");
    if (!cleanText) return setError("Informe a dica.");
    if (cleanText.length > 40) return setError("A dica deve ter no maximo 40 caracteres.");

    setLoading(true);
    try {
      const data: CluePayload = {
        gameId: Number(gameId),
        playerId: Number(playerId),
        roundNumber: Number(roundNumber),
        clue: cleanText,
      };
      if (clue) await cluesService.update(clue.id, data);
      else await cluesService.create(data);
      if (!clue) {
        setPlayerId("");
        setText("");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar dica.");
    } finally {
      setLoading(false);
    }
  }

  const cleanNumber = (value: string) => value.replace(/\D/g, "");

  return (
    <form className={clue ? "stack" : "form-card"} onSubmit={submit} noValidate>
      {!clue && (
        <div>
          <span className="eyebrow">Dica da rodada</span>
          <h2>Enviar dica</h2>
          <p>Registre uma dica para um jogador vivo na rodada atual da partida.</p>
        </div>
      )}
      <label>ID da partida<input value={gameId} onChange={(event) => setGameId(cleanNumber(event.target.value))} placeholder="Ex.: 1" /></label>
      <label>ID do jogador<input value={playerId} onChange={(event) => setPlayerId(cleanNumber(event.target.value))} placeholder="Ex.: 2" /></label>
      <label>Rodada<input value={roundNumber} onChange={(event) => setRoundNumber(cleanNumber(event.target.value))} placeholder="Ex.: 1" /></label>
      <label>Dica<input value={text} onChange={(event) => setText(event.target.value)} placeholder="Ex.: Frio" maxLength={40} /></label>
      {error && <p className="form-error">{error}</p>}
      <SendClueButton loading={loading} label={clue ? "Salvar dica" : "Enviar dica"} />
    </form>
  );
}
