"use client";

import { useCallback, useEffect, useState } from "react";
import { VotesTable } from "@/components/data-table/votes-table";
import { gamesService } from "@/services/games.service";
import { playersService } from "@/services/players.service";
import { votesService } from "@/services/votes.service";
import type { Game, Player, Vote } from "@/types/api";

type PlayerLookup = Record<number, Record<number, Player>>;
type GameLookup = Record<number, Game>;

const PAGE_SIZE = 10;

export default function VotesPage() {
  const [rows, setRows] = useState<Vote[]>([]);
  const [playersByGame, setPlayersByGame] = useState<PlayerLookup>({});
  const [gamesById, setGamesById] = useState<GameLookup>({});
  const [roomId, setRoomId] = useState("");
  const [voterId, setVoterId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState("");

  const playerName = useCallback((voteGameId: number, playerId: number | null | undefined) => {
    if (!playerId) return "Sem alvo";
    const player = playersByGame[voteGameId]?.[playerId];
    return player?.user?.name ?? `Jogador #${playerId}`;
  }, [playersByGame]);

  const roomName = useCallback((voteGameId: number) => {
    const game = gamesById[voteGameId];
    return game?.room?.name ?? `Sala #${game?.roomId ?? "-"}`;
  }, [gamesById]);

  const loadContext = useCallback(async (votes: Vote[]) => {
    const gameIds = Array.from(new Set(votes.map((vote) => vote.gameId)));
    if (gameIds.length === 0) {
      setPlayersByGame({});
      setGamesById({});
      return;
    }

    const [gameEntries, playerEntries] = await Promise.all([
      Promise.all(gameIds.map(async (id) => [id, await gamesService.get(id)] as const)),
      Promise.all(gameIds.map(async (id) => {
        const result = await playersService.list({ game_id: id, page: 1, limit: 50 });
        return [id, result.data] as const;
      })),
    ]);

    setGamesById(Object.fromEntries(gameEntries));
    setPlayersByGame(Object.fromEntries(
      playerEntries.map(([id, players]) => [
        id,
        Object.fromEntries(players.map((player) => [player.id, player])),
      ]),
    ));
  }, []);

  const loadByRoom = useCallback(async () => {
    const gamesPage = await gamesService.list({ room_id: Number(roomId), page: 1, limit: 50 });
    const votes = (await Promise.all(
      gamesPage.data.map((game) => votesService.list({
        game_id: game.id,
        voter_id: voterId ? Number(voterId) : undefined,
        target_player_id: targetId ? Number(targetId) : undefined,
        page: 1,
        limit: 50,
      })),
    )).flatMap((result) => result.data);

    const sorted = votes.sort((a, b) => b.gameId - a.gameId || b.roundNumber - a.roundNumber || b.voterId - a.voterId);
    const start = (page - 1) * PAGE_SIZE;
    const visible = sorted.slice(start, start + PAGE_SIZE);

    setRows(visible);
    setLastPage(Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)));
    await loadContext(visible);
  }, [roomId, voterId, targetId, page, loadContext]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      if (roomId) {
        await loadByRoom();
      } else {
        const result = await votesService.list({
          voter_id: voterId ? Number(voterId) : undefined,
          target_player_id: targetId ? Number(targetId) : undefined,
          page,
          limit: PAGE_SIZE,
        });
        setRows(result.data);
        setLastPage(result.meta.lastPage);
        await loadContext(result.data);
      }
    } catch (err) {
      setLoadError(true);
      setNotice(err instanceof Error ? err.message : "Erro ao listar votos.");
    } finally {
      setLoading(false);
    }
  }, [roomId, voterId, targetId, page, loadByRoom, loadContext]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  function handleFilterChange(key: string, value: string) {
    const clean = value.replace(/\D/g, "");
    setPage(1);
    if (key === "room") setRoomId(clean);
    if (key === "voter") setVoterId(clean);
    if (key === "target") setTargetId(clean);
  }

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">Votacao</span>
          <h1>Votos registrados</h1>
          <p>Consulte os votos salvos no banco por sala, votante e alvo.</p>
        </div>
      </header>

      {notice && <div className="notice" onClick={() => setNotice("")}>{notice}<span>x</span></div>}

      <VotesTable
        rows={rows}
        loading={loading}
        connected={!loadError}
        filters={{ roomId, voterId, targetId }}
        page={page}
        lastPage={lastPage}
        onPageChange={setPage}
        onFilterChange={handleFilterChange}
        playerName={playerName}
        roomName={roomName}
      />
    </>
  );
}
