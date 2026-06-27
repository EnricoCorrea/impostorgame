"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";
import { BrandMark } from "@/components/layout/brand-mark";
import { authService } from "@/services/auth.service";
import { cluesService } from "@/services/clues.service";
import { gamesService } from "@/services/games.service";
import { messagesService } from "@/services/messages.service";
import { roomsService } from "@/services/rooms.service";
import type { Clue, Game, GamePrivateState, Message, Room, User } from "@/types/api";

const phaseCopy = {
  WAITING: { title: "Lobby", text: "Aguardando o anfitriao iniciar a partida." },
  CLUE: { title: "Dicas", text: "Cada jogador vivo envia uma dica. Quando todos enviarem, abre a discussao." },
  DISCUSSING: { title: "Discussao", text: "Conversem pelo chat e observem quem esta improvisando." },
  VOTING: { title: "Votacao", text: "Vote em um suspeito ou pule seu voto." },
};

export default function PlayRoomPage() {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const roomId = Number(params.roomId);
  const [me, setMe] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [state, setState] = useState<GamePrivateState | null>(null);
  const [clues, setClues] = useState<Clue[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clue, setClue] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localVotedRound, setLocalVotedRound] = useState<number | null>(null);
  const chatLogRef = useRef<HTMLDivElement | null>(null);
  const activeGameIdRef = useRef<number | null>(null);

  const inviteLink = typeof window === "undefined" ? "" : `${window.location.origin}/play/${roomId}`;
  const isHost = Boolean(me && room && me.id === room.hostId);
  const phase = state?.status ?? game?.status ?? "WAITING";
  const myPlayer = useMemo(() => state?.players.find((player) => player.userId === me?.id) ?? null, [me?.id, state]);
  const activePlayers = state?.players ?? [];
  const currentRoundClues = useMemo(() => clues.filter((item) => item.roundNumber === state?.round), [clues, state?.round]);
  const chatGroups = useMemo(() => {
    const sortedMessages = [...messages].sort((a, b) => {
      const dateDiff = new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      return dateDiff || b.id - a.id;
    });
    return sortedMessages.reduce<Array<{ playerId: number; items: Message[] }>>((groups, item) => {
      const group = groups.find((entry) => entry.playerId === item.playerId);
      if (group) group.items.push(item);
      else groups.push({ playerId: item.playerId, items: [item] });
      return groups;
    }, []);
  }, [messages]);
  const aliveCount = state?.aliveCount ?? activePlayers.filter((player) => player.isAlive).length;
  const clueCount = state?.clueCount ?? currentRoundClues.length;
  const voteCount = state?.voteCount ?? 0;
  const hasSubmittedClue = Boolean(myPlayer && currentRoundClues.some((item) => item.playerId === myPlayer.id));
  const hasVoted = localVotedRound === state?.round;
  const hasFinished = Boolean(state?.finishedAt || game?.finishedAt);
  const winner = state?.winner ?? game?.winner ?? null;
  const myRole = state?.myRole ?? null;
  const didWin = Boolean(winner && myRole && winner === myRole);

  const playerName = useCallback((playerId: number) => {
    const fromState = activePlayers.find((player) => player.id === playerId)?.name;
    return fromState ?? `Jogador #${playerId}`;
  }, [activePlayers]);

  const load = useCallback(async (options: { silent?: boolean } = {}) => {
    if (!authService.hasToken()) {
      router.replace("/login");
      return;
    }
    if (!options.silent) setBusy(true);
    try {
      const profile = await authService.me();
      setMe(profile);
      try {
        await roomsService.join(roomId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Nao foi possivel entrar nesta sala.";
        setNotice(message);
        window.sessionStorage.setItem("playNotice", message);
        router.replace("/play");
        return;
      }
      const [freshRoom, gamesPage] = await Promise.all([
        roomsService.get(roomId),
        gamesService.list({ room_id: roomId, page: 1, limit: 10 }),
      ]);
      const games = [...(gamesPage?.data ?? [])].sort((a, b) => {
        const dateDiff = new Date(b.startedAt ?? 0).getTime() - new Date(a.startedAt ?? 0).getTime();
        return dateDiff || b.id - a.id;
      });
      const activeGame = games.find((item) => !item.finishedAt) ?? games[0] ?? null;
      const changedGame = activeGameIdRef.current !== (activeGame?.id ?? null);
      activeGameIdRef.current = activeGame?.id ?? null;
      setRoom(freshRoom);
      setGame(activeGame);
      if (changedGame) {
        setState(null);
        setClues([]);
        setMessages([]);
        setClue("");
        setMessage("");
        setLocalVotedRound(null);
      }
      if (activeGame) {
        const [privateState, cluePage, messagePage] = await Promise.all([
          gamesService.state(activeGame.id).catch(() => null),
          cluesService.list({ game_id: activeGame.id, page: 1, limit: 50 }).catch(() => null),
          messagesService.list({ game_id: activeGame.id, page: 1, limit: 50 }).catch(() => null),
        ]);
        setState(privateState);
        setClues(cluePage?.data ?? []);
        setMessages(messagePage?.data ?? []);
        if (privateState && privateState.round !== localVotedRound && privateState.status !== "VOTING") setLocalVotedRound(null);
      } else {
        setState(null);
        setClues([]);
        setMessages([]);
        setLocalVotedRound(null);
        activeGameIdRef.current = null;
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel carregar a sala.");
    } finally {
      if (!options.silent) setBusy(false);
    }
  }, [localVotedRound, roomId, router]);

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load({ silent: true }), 2500);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const chatLog = chatLogRef.current;
    if (chatLog) chatLog.scrollTo({ top: 0, behavior: "smooth" });
  }, [messages, phase]);

  async function createOrStartGame() {
    if (!room) return;
    setBusy(true);
    setNotice("");
    try {
      const current = game && !game.finishedAt ? game : await gamesService.create(room.id);
      const started = await gamesService.start(current.id);
      setGame(started);
      setState(null);
      setClues([]);
      setMessages([]);
      setClue("");
      setMessage("");
      setLocalVotedRound(null);
      await load({ silent: true });
      setNotice(game?.finishedAt ? "Nova partida iniciada." : "Partida iniciada.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel iniciar a partida.");
    } finally {
      setBusy(false);
    }
  }

  async function leaveRoom() {
    setBusy(true);
    try {
      await roomsService.leave(roomId);
      router.push("/play");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel sair da sala.");
      setBusy(false);
    }
  }

  async function submitClue(event: FormEvent) {
    event.preventDefault();
    if (!game || !state?.myPlayerId || !clue.trim() || hasSubmittedClue) return;
    setBusy(true);
    try {
      await cluesService.create({ gameId: game.id, playerId: state.myPlayerId, roundNumber: state.round, clue: clue.trim() });
      setClue("");
      await load({ silent: true });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel enviar a dica.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!game || !state?.myPlayerId || !message.trim() || phase !== "DISCUSSING") return;
    try {
      await messagesService.create({ gameId: game.id, playerId: state.myPlayerId, content: message.trim() });
      setMessage("");
      await load({ silent: true });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel enviar a mensagem.");
    }
  }

  async function vote(targetId?: number) {
    if (!game || hasVoted) return;
    setBusy(true);
    try {
      await gamesService.vote(game.id, targetId);
      setLocalVotedRound(state?.round ?? null);
      setNotice(targetId ? "Voto registrado." : "Voto pulado.");
      await load({ silent: true });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel votar.");
    } finally {
      setBusy(false);
    }
  }

  async function advancePhase() {
    if (!game) return;
    setBusy(true);
    try {
      await gamesService.nextPhase(game.id);
      await load({ silent: true });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel avancar a fase.");
    } finally {
      setBusy(false);
    }
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const playerCount = room?.users?.length ?? 0;

  return (
    <main className="player-page game-page">
      <header className="player-topbar">
        <Link className="brand" href="/play"><BrandMark /><span>Impostor<strong>Game</strong></span></Link>
        <div className="player-account"><span>{me?.name ?? "Jogador"}</span><button className="text-button" onClick={leaveRoom} disabled={busy}>Sair da sala</button><Link className="text-button" href="/play">Salas</Link></div>
      </header>

      {notice && <div className="notice" onClick={() => setNotice("")}>{notice}<span>x</span></div>}

      <section className="room-header">
        <div>
          <span className="eyebrow">Sala #{roomId}</span>
          <h1>{room?.name ?? "Carregando sala"}</h1>
          <p>{playerCount} jogador(es) no lobby. Minimo de 3 para iniciar.</p>
        </div>
        <div className="room-actions">
          <ActionButton variant="secondary" onClick={copyInvite}>{copied ? "Link copiado" : "Copiar convite"}</ActionButton>
          <ActionButton variant="ghost" onClick={leaveRoom} disabled={busy}>Sair</ActionButton>
          {isHost && !game && <ActionButton onClick={createOrStartGame} loading={busy}>Iniciar partida</ActionButton>}
          {isHost && game && !game.finishedAt && phase === "DISCUSSING" && <ActionButton onClick={advancePhase} loading={busy}>Abrir votacao</ActionButton>}
        </div>
      </section>

      {hasFinished && (
        <section className={`play-panel result-panel ${didWin ? "result-win" : "result-loss"}`}>
          <span className="eyebrow">Fim de jogo</span>
          <h2>{didWin ? "Vitoria" : "Derrota"}</h2>
          <p>
            {didWin
              ? myRole === "IMPOSTOR"
                ? "Voce enganou a mesa e venceu como impostor."
                : "O grupo encontrou o impostor."
              : myRole === "IMPOSTOR"
                ? "A mesa descobriu voce."
                : "O impostor sobreviveu ate o fim."}
          </p>
          <strong>Vencedor: {winner === "IMPOSTOR" ? "Impostor" : "Inocentes"}</strong>
          <div className="modal-actions">{isHost && <ActionButton onClick={createOrStartGame} loading={busy}>Iniciar nova partida</ActionButton>}<ActionButton variant="secondary" onClick={() => router.push("/play")}>Voltar para salas</ActionButton></div>
        </section>
      )}

      <section className="game-shell">
        <aside className="play-panel game-status-panel">
          <span className="eyebrow">Fase atual</span>
          <h2>{phaseCopy[phase].title}</h2>
          <p>{phaseCopy[phase].text}</p>
          <div className="word-card">
            <span>{myRole === "IMPOSTOR" ? "Sua pista" : "Sua palavra"}</span>
            <strong>{state?.myWord ?? (game ? "Aguardando inicio" : "Sem partida")}</strong>
          </div>
          <div className="role-pill">{myRole === "IMPOSTOR" ? "Voce e o impostor" : myRole === "INNOCENT" ? "Voce conhece a palavra" : "Lobby"}</div>
          {phase === "CLUE" && <div className="progress-box">Dicas: {clueCount}/{aliveCount}</div>}
          {phase === "VOTING" && <div className="progress-box">Votos: {voteCount}/{aliveCount}</div>}
          {hasFinished && <div className="winner-box">Vencedor: {winner === "IMPOSTOR" ? "Impostor" : "Inocentes"}</div>}
        </aside>

        <section className="play-panel table-stage">
          <div className="panel-title-row"><div><span className="eyebrow">Jogadores</span><h2>Mesa</h2></div><span className="status-pill">Rodada {state?.round ?? 0}</span></div>
          <div className="player-table">
            {(state?.players.length ? state.players : room?.users?.map((user) => ({ id: user.id, userId: user.id, name: user.name, isAlive: true, voteCount: 0 })) ?? []).map((player) => (
              <article className={`player-seat ${player.userId === me?.id ? "is-me" : ""}`} key={`${player.id}-${player.userId}`}>
                <div className="seat-avatar">{(player.name ?? "J").slice(0, 2).toUpperCase()}</div>
                <div><strong>{player.name ?? `Jogador #${player.userId}`}</strong><span>{player.isAlive ? "ativo" : "eliminado"}{player.userId === room?.hostId ? " - anfitriao" : ""}</span>{phase === "VOTING" && <span className="vote-count-label">{player.voteCount ?? 0} voto(s)</span>}</div>
                {phase === "VOTING" && player.isAlive && player.id !== myPlayer?.id && <button className="button button-secondary" onClick={() => vote(player.id)} disabled={busy || hasVoted}>Votar</button>}
              </article>
            ))}
          </div>
          {phase === "VOTING" && <div className="vote-skip-row"><ActionButton variant="ghost" onClick={() => vote()} disabled={busy || hasVoted}>{hasVoted ? "Voto enviado" : "Pular voto"}</ActionButton></div>}
        </section>

        <section className="play-panel clue-panel">
          <div className="panel-title-row"><div><span className="eyebrow">Dicas</span><h2>Rodada atual</h2></div>{phase === "CLUE" && <span className="status-pill">{clueCount}/{aliveCount}</span>}</div>
          <form className="inline-form" onSubmit={submitClue}>
            <input value={clue} onChange={(event) => setClue(event.target.value)} placeholder={hasSubmittedClue ? "Voce ja enviou sua dica" : "Digite sua dica"} maxLength={40} disabled={phase !== "CLUE" || !myPlayer?.isAlive || hasSubmittedClue} />
            <ActionButton type="submit" loading={busy} disabled={phase !== "CLUE" || !myPlayer?.isAlive || hasSubmittedClue}>Enviar</ActionButton>
          </form>
          <div className="clue-list">
            {currentRoundClues.length === 0 ? <p className="empty-state">Nenhuma dica enviada nesta rodada.</p> : currentRoundClues.map((item) => (
              <div className="clue-row" key={item.id}><strong>{playerName(item.playerId)}</strong><span>{item.clue}</span></div>
            ))}
          </div>
        </section>

        <section className="play-panel chat-panel">
          <div><span className="eyebrow">Chat</span><h2>Discussao</h2></div>
          <div className="chat-log" ref={chatLogRef}>
            {phase !== "DISCUSSING" ? <p className="empty-state">O chat abre apenas na fase de discussao.</p> : messages.length === 0 ? <p className="empty-state">O chat ainda esta quieto.</p> : chatGroups.map((group) => (
              <article className="chat-user-group" key={group.playerId}>
                <strong>{playerName(group.playerId)}</strong>
                {group.items.map((item) => <span className="chat-message" key={item.id}>{item.content}</span>)}
              </article>
            ))}
          </div>
          <form className="inline-form" onSubmit={sendMessage}>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escreva no chat" maxLength={160} disabled={phase !== "DISCUSSING" || !game || !myPlayer?.isAlive} />
            <ActionButton type="submit" variant="secondary" disabled={phase !== "DISCUSSING" || !game || !myPlayer?.isAlive}>Enviar</ActionButton>
          </form>
        </section>
      </section>
    </main>
  );
}
