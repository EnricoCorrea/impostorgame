"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { cluesService } from "@/services/clues.service";
import { gamesService } from "@/services/games.service";
import { createLiveGameSocket, type LiveSocketStatus } from "@/services/live-game.service";
import { messagesService } from "@/services/messages.service";
import { playersService } from "@/services/players.service";
import { roomsService } from "@/services/rooms.service";
import { votesService } from "@/services/votes.service";
import type { Clue, Game, LiveGameUpdate, Message, Player, Room, VoteScore } from "@/types/api";

const statusText: Record<LiveSocketStatus, string> = {
  connecting: "Conectando",
  connected: "Conectado",
  disconnected: "Desconectado",
  error: "Sem conexao",
};

export function LiveGameBoard({ onNotice }: { onNotice: (message: string) => void }) {
  const [roomId, setRoomId] = useState("");
  const [socketStatus, setSocketStatus] = useState<LiveSocketStatus>("disconnected");
  const [room, setRoom] = useState<Room | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [update, setUpdate] = useState<LiveGameUpdate | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clues, setClues] = useState<Clue[]>([]);
  const [scores, setScores] = useState<VoteScore[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<ReturnType<typeof createLiveGameSocket> | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => () => {
    socketRef.current?.close();
    if (pollRef.current) window.clearInterval(pollRef.current);
  }, []);

  const currentGameId = update?.gameId ?? game?.id;
  const currentPhase = update?.status ?? game?.status ?? "WAITING";
  const currentRound = update?.roundNumber ?? game?.roundNumber ?? 0;
  const secretWord = players.find((player) => player.word)?.word?.word ?? "Aguardando palavra";
  const impostorClue = players.find((player) => player.word)?.word?.impostorClue;
  const aliveCount = players.filter((player) => player.isAlive).length;
  const currentRoundClues = clues.filter((clue) => clue.roundNumber === currentRound);
  const hasFinished = Boolean(update?.finishedAt ?? game?.finishedAt);
  const visibleWinner = hasFinished ? update?.winner ?? game?.winner ?? "Em aberto" : "Em aberto";

  const phaseEndsAt = update?.phaseEndsAt
    ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(update.phaseEndsAt))
    : "Sem tempo definido";

  function playerName(playerId: number) {
    const player = players.find((item) => item.id === playerId);
    return player?.user?.name ?? `Jogador #${playerId}`;
  }

  async function refreshScores(gameValue: number, roundValue: number) {
    try {
      const result = await votesService.list({ game_id: gameValue, limit: 50 });
      const totals = result.data.reduce<Record<number, number>>((acc, vote) => {
        if (roundValue && vote.roundNumber !== roundValue) return acc;
        if (vote.targetPlayerId) acc[vote.targetPlayerId] = (acc[vote.targetPlayerId] ?? 0) + 1;
        return acc;
      }, {});
      setScores(Object.entries(totals).map(([target, votes]) => ({ targetId: Number(target), votes })));
    } catch {
      setScores([]);
    }
  }

  async function loadBoard(nextRoomId = roomId, options: { silent?: boolean } = {}) {
    if (!nextRoomId) return;
    if (!options.silent) setLoading(true);

    try {
      const numericRoomId = Number(nextRoomId);
      const [nextRoom, gamesPage] = await Promise.all([
        roomsService.get(numericRoomId),
        gamesService.list({ room_id: numericRoomId, page: 1, limit: 10 }),
      ]);
      const games = gamesPage.data ?? [];
      const activeGame =
        games.find((item) => !item.finishedAt && item.status !== "WAITING") ??
        games.find((item) => !item.finishedAt) ??
        null;

      setRoom(nextRoom);
      setGame(activeGame);

      if (!activeGame) {
        setUpdate(null);
        setPlayers([]);
        setMessages([]);
        setClues([]);
        setScores([]);
        if (!options.silent) onNotice(`Sala #${nextRoomId} sem partida criada.`);
        return;
      }

      setUpdate((current) => ({
        ...current,
        gameId: activeGame.id,
        roomId: activeGame.roomId,
        status: activeGame.status,
        roundNumber: activeGame.roundNumber,
        winner: activeGame.finishedAt ? activeGame.winner ?? null : null,
        finishedAt: activeGame.finishedAt ?? null,
      }));

      const [playerPage, messagePage, cluePage] = await Promise.all([
        playersService.list({ game_id: activeGame.id, page: 1, limit: 50 }),
        messagesService.list({ game_id: activeGame.id, page: 1, limit: 50 }),
        cluesService.list({ game_id: activeGame.id, page: 1, limit: 50 }),
      ]);

      setPlayers(playerPage.data ?? []);
      setMessages(messagePage.data ?? []);
      setClues(cluePage.data ?? []);
      await refreshScores(activeGame.id, activeGame.roundNumber);

      if (!options.silent) onNotice(`Sala #${nextRoomId} acompanhada.`);
    } catch (err) {
      if (!options.silent) onNotice(err instanceof Error ? err.message : "Nao foi possivel acompanhar a sala.");
    } finally {
      if (!options.silent) setLoading(false);
    }
  }

  async function connect(event: FormEvent) {
    event.preventDefault();
    if (!roomId) return onNotice("Informe o ID da sala para acompanhar.");

    socketRef.current?.close();
    if (pollRef.current) window.clearInterval(pollRef.current);

    const socket = createLiveGameSocket({
      onStatus: setSocketStatus,
      onMessage: (message) => {
        if (message.data) {
          setUpdate((current) => {
            const next = { ...current, ...message.data };
            return next.finishedAt ? next : { ...next, winner: null };
          });
          if (message.data.scores) setScores(message.data.scores);
          void loadBoard(String(message.data.roomId ?? roomId), { silent: true });
        }
        if (message.message) onNotice(message.message);
      },
    });

    socketRef.current = socket;
    socket.send("join_room", { roomId: Number(roomId) });
    await loadBoard(roomId);
    pollRef.current = window.setInterval(() => void loadBoard(roomId, { silent: true }), 3000);
  }

  const cleanNumber = (value: string) => value.replace(/\D/g, "");

  return (
    <section className="live-board">
      <form className="live-setup live-setup-observer" onSubmit={connect}>
        <div>
          <span className="eyebrow">Sala ao vivo</span>
          <h2>Acompanhar partida</h2>
        </div>
        <label>Sala<input value={roomId} onChange={(event) => setRoomId(cleanNumber(event.target.value))} placeholder="ID da sala" /></label>
        <ActionButton type="submit" loading={loading}>Conectar</ActionButton>
        <span className={`live-indicator ${socketStatus === "connected" ? "" : "offline"}`}><i /> {statusText[socketStatus]}</span>
      </form>

      <div className="live-grid live-grid-observer">
        <article className="live-phase">
          <span className="eyebrow">Fase atual</span>
          <strong>{currentPhase}</strong>
          <small>Rodada {currentRound} - {phaseEndsAt}</small>
        </article>
        <article className="live-phase">
          <span className="eyebrow">Palavra da mesa</span>
          <strong>{secretWord}</strong>
          <small>{impostorClue ? `Pista do impostor: ${impostorClue}` : "Pista indisponivel"}</small>
        </article>
        <article className="live-phase">
          <span className="eyebrow">Sala</span>
          <strong>{room?.name ?? "Nao conectada"}</strong>
          <small>{currentGameId ? `Partida #${currentGameId}` : "Sem partida ativa"}</small>
        </article>
      </div>

      <div className="live-sections">
        <article className="live-panel">
          <div>
            <span className="eyebrow">Mesa</span>
            <h2>Jogadores</h2>
          </div>
          <div className="live-player-list">
            {players.map((player) => (
              <div className="live-player-row" key={player.id}>
                <span>{player.user?.name ?? `Usuario #${player.userId}`}</span>
                <strong>{player.isAlive ? "Vivo" : "Eliminado"}</strong>
              </div>
            ))}
            {!players.length && <p className="empty-inline">Nenhum jogador carregado.</p>}
          </div>
        </article>

        <article className="live-panel">
          <div>
            <span className="eyebrow">Estado do jogo</span>
            <h2>Resumo</h2>
          </div>
          <dl className="live-summary">
            <div><dt>Jogadores vivos</dt><dd>{aliveCount}/{players.length}</dd></div>
            <div><dt>Dicas da rodada</dt><dd>{currentRoundClues.length}</dd></div>
            <div><dt>Vencedor</dt><dd>{visibleWinner}</dd></div>
          </dl>
        </article>
      </div>

      <div className="live-sections">
        <article className="live-panel">
          <div>
            <span className="eyebrow">Chat</span>
            <h2>Mensagens</h2>
          </div>
          <div className="live-feed">
            {messages.map((message) => (
              <div className="live-feed-row" key={message.id}>
                <strong>{playerName(message.playerId)}</strong>
                <span>{message.content}</span>
              </div>
            ))}
            {!messages.length && <p className="empty-inline">Nenhuma mensagem na partida.</p>}
          </div>
        </article>

        <article className="live-panel">
          <div>
            <span className="eyebrow">Dicas</span>
            <h2>Rodada atual</h2>
          </div>
          <div className="live-feed">
            {currentRoundClues.map((clue) => (
              <div className="live-feed-row" key={clue.id}>
                <strong>{playerName(clue.playerId)}</strong>
                <span>{clue.clue}</span>
              </div>
            ))}
            {!currentRoundClues.length && <p className="empty-inline">Nenhuma dica nesta rodada.</p>}
          </div>
        </article>
      </div>

      <div className="scoreboard">
        <h2>Placar da rodada</h2>
        {scores.map((score) => (
          <div className="score-row" key={score.targetId}>
            <span>{playerName(score.targetId)}</span>
            <strong>{score.votes}</strong>
          </div>
        ))}
        {!scores.length && <p className="empty-inline">Nenhum voto registrado na rodada.</p>}
      </div>
    </section>
  );
}
