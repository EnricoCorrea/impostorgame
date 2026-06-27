"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { gamesService } from "@/services/games.service";
import { createLiveGameSocket, type LiveSocketStatus } from "@/services/live-game.service";
import { votesService } from "@/services/votes.service";
import type { GamePrivateState, LiveGameUpdate, VoteScore } from "@/types/api";

const statusText: Record<LiveSocketStatus, string> = {
  connecting: "Conectando",
  connected: "Conectado",
  disconnected: "Desconectado",
  error: "Sem conexao",
};

export function LiveGameBoard({ onNotice }: { onNotice: (message: string) => void }) {
  const [roomId, setRoomId] = useState("");
  const [gameId, setGameId] = useState("");
  const [voterId, setVoterId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [socketStatus, setSocketStatus] = useState<LiveSocketStatus>("disconnected");
  const [state, setState] = useState<GamePrivateState | null>(null);
  const [update, setUpdate] = useState<LiveGameUpdate | null>(null);
  const [scores, setScores] = useState<VoteScore[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<ReturnType<typeof createLiveGameSocket> | null>(null);

  useEffect(() => () => {
    socketRef.current?.close();
  }, []);

  const currentPhase = update?.status ?? state?.status ?? "WAITING";
  const currentRound = update?.roundNumber ?? state?.round ?? 0;
  const phaseEndsAt = update?.phaseEndsAt
    ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(update.phaseEndsAt))
    : "Sem tempo definido";
  const hasTableIds = Boolean(roomId && gameId);
  const canVote = Boolean(roomId && gameId && voterId && targetId);

  async function refreshScores(gameValue = gameId) {
    if (!gameValue) return;
    try {
      const result = await votesService.list({ game_id: Number(gameValue), limit: 100 });
      const totals = result.data.reduce<Record<number, number>>((acc, vote) => {
        if (vote.targetPlayerId) acc[vote.targetPlayerId] = (acc[vote.targetPlayerId] ?? 0) + 1;
        return acc;
      }, {});
      setScores(Object.entries(totals).map(([target, votes]) => ({ targetId: Number(target), votes })));
    } catch {
      setScores([]);
    }
  }

  async function connect(event: FormEvent) {
    event.preventDefault();
    if (!hasTableIds) return onNotice("Informe sala e partida para entrar na mesa.");
    socketRef.current?.close();
    const socket = createLiveGameSocket({
      onStatus: setSocketStatus,
      onMessage: (message) => {
        if (message.data) {
          setUpdate((current) => ({ ...current, ...message.data }));
          if (message.data.scores) setScores(message.data.scores);
          void refreshScores(String(message.data.gameId ?? gameId));
        }
        if (message.message) onNotice(message.message);
      },
    });
    socketRef.current = socket;
    socket.send("join_room", { roomId: Number(roomId) });
    await refreshScores(gameId);
    onNotice(`Mesa da sala #${roomId} conectada.`);
  }

  function joinRoom() {
    if (!roomId) return onNotice("Informe a sala antes de entrar no canal.");
    socketRef.current?.send("join_room", { roomId: Number(roomId) });
    onNotice(`Voce entrou na mesa da sala #${roomId}.`);
  }

  async function loadState() {
    if (!gameId) return onNotice("Informe a partida para consultar o estado.");
    setLoading(true);
    try {
      setState(await gamesService.state(Number(gameId)));
      await refreshScores(gameId);
      onNotice("Estado privado atualizado.");
    } catch (err) {
      onNotice(err instanceof Error ? err.message : "Estado privado indisponivel.");
    } finally {
      setLoading(false);
    }
  }

  function startBySocket() {
    if (!gameId || !roomId) return onNotice("Informe sala e partida para iniciar.");
    socketRef.current?.send("start_game", { gameId: Number(gameId), roomId: Number(roomId) });
    onNotice("Inicio solicitado.");
  }

  function voteBySocket() {
    if (!canVote) return onNotice("Informe sala, partida, votante e alvo para votar.");
    socketRef.current?.send("vote", { gameId: Number(gameId), roomId: Number(roomId), userId: Number(voterId), targetId: Number(targetId) });
    void refreshScores(gameId);
    onNotice("Voto enviado.");
  }

  const cleanNumber = (value: string) => value.replace(/\D/g, "");

  return (
    <section className="live-board">
      <form className="live-setup" onSubmit={connect}>
        <div>
          <span className="eyebrow">Mesa</span>
          <h2>Entrar em partida existente</h2>
        </div>
        <label>Sala<input value={roomId} onChange={(event) => setRoomId(cleanNumber(event.target.value))} placeholder="ID da sala" /></label>
        <label>Partida<input value={gameId} onChange={(event) => setGameId(cleanNumber(event.target.value))} placeholder="ID da partida" /></label>
        <ActionButton type="submit">Entrar ao vivo</ActionButton>
        <span className={`live-indicator ${socketStatus === "connected" ? "" : "offline"}`}><i /> {statusText[socketStatus]}</span>
      </form>

      <div className="live-grid">
        <article className="live-phase">
          <span className="eyebrow">Fase atual</span>
          <strong>{currentPhase}</strong>
          <small>Rodada {currentRound} - {phaseEndsAt}</small>
        </article>
        <article className="live-phase">
          <span className="eyebrow">Resultado</span>
          <strong>{update?.winner ?? state?.winner ?? "Em aberto"}</strong>
          <small>{state?.finishedAt ? "Partida finalizada" : "Aguardando definicao"}</small>
        </article>
      </div>

      <div className="live-sections">
        <article className="live-panel">
          <div>
            <span className="eyebrow">Acoes da partida</span>
            <h2>Controle da mesa</h2>
          </div>
          <div className="live-actions">
            <ActionButton variant="secondary" onClick={joinRoom} disabled={!roomId}>Entrar na sala</ActionButton>
            <ActionButton variant="secondary" onClick={loadState} loading={loading} disabled={!gameId}>Atualizar estado</ActionButton>
            <ActionButton onClick={startBySocket} disabled={!hasTableIds}>Iniciar partida</ActionButton>
          </div>
        </article>

        <article className="live-panel">
          <div>
            <span className="eyebrow">Votacao</span>
            <h2>Enviar voto</h2>
          </div>
          <div className="vote-inline">
            <label>Votante<input value={voterId} onChange={(event) => setVoterId(cleanNumber(event.target.value))} placeholder="ID do usuario" /></label>
            <label>Alvo<input value={targetId} onChange={(event) => setTargetId(cleanNumber(event.target.value))} placeholder="ID do jogador" /></label>
            <ActionButton variant="secondary" onClick={voteBySocket} disabled={!canVote}>Enviar voto</ActionButton>
          </div>
        </article>
      </div>

      <div className="scoreboard">
        <h2>Placar da rodada</h2>
        {(scores.length ? scores : []).map((score) => (
          <div className="score-row" key={score.targetId}>
            <span>Jogador #{score.targetId}</span>
            <strong>{score.votes}</strong>
          </div>
        ))}
        {!scores.length && <p className="empty-inline">Nenhum placar recebido em tempo real.</p>}
      </div>
    </section>
  );
}
