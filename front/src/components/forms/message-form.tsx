"use client";

import { useState, type FormEvent } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { messagesService, type MessagePayload } from "@/services/messages.service";
import type { Message } from "@/types/api";

export function MessageForm({ message, onSaved }: { message?: Message; onSaved: () => void }) {
  const [gameId, setGameId] = useState(message?.gameId ? String(message.gameId) : "");
  const [playerId, setPlayerId] = useState(message?.playerId ? String(message.playerId) : "");
  const [content, setContent] = useState(message?.content ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const cleanContent = content.trim();
    if (!gameId || !playerId) return setError("Preencha a partida e o jogador.");
    if (!cleanContent) return setError("Informe a mensagem.");
    if (cleanContent.length > 160) return setError("A mensagem deve ter no maximo 160 caracteres.");

    setLoading(true);
    try {
      const data: MessagePayload = {
        gameId: Number(gameId),
        playerId: Number(playerId),
        content: cleanContent,
      };
      if (message) await messagesService.update(message.id, data);
      else await messagesService.create(data);
      if (!message) {
        setPlayerId("");
        setContent("");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar mensagem.");
    } finally {
      setLoading(false);
    }
  }

  const cleanNumber = (value: string) => value.replace(/\D/g, "");

  return (
    <form className={message ? "stack" : "form-card"} onSubmit={submit} noValidate>
      {!message && (
        <div>
          <span className="eyebrow">Chat da partida</span>
          <h2>Enviar mensagem</h2>
          <p>Registre uma mensagem para um jogador vivo durante a fase de discussao.</p>
        </div>
      )}
      <label>ID da partida<input value={gameId} onChange={(event) => setGameId(cleanNumber(event.target.value))} placeholder="Ex.: 1" /></label>
      <label>ID do jogador<input value={playerId} onChange={(event) => setPlayerId(cleanNumber(event.target.value))} placeholder="Ex.: 2" /></label>
      <label>Mensagem<input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Ex.: Diego esta suspeito..." maxLength={160} /></label>
      {error && <p className="form-error">{error}</p>}
      <ActionButton type="submit" loading={loading}>{message ? "Salvar mensagem" : "Enviar mensagem"}</ActionButton>
    </form>
  );
}
