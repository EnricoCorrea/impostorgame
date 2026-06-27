"use client";

import { DataTable, type Column } from "@/components/data-table/data-table";
import type { Vote } from "@/types/api";

export function VotesTable({
  rows,
  loading,
  connected,
  filters,
  page,
  lastPage,
  onPageChange,
  onFilterChange,
  playerName,
  roomName,
}: {
  rows: Vote[];
  loading: boolean;
  connected: boolean;
  filters: { roomId: string; voterId: string; targetId: string };
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onFilterChange: (key: string, value: string) => void;
  playerName: (gameId: number, playerId: number | null | undefined) => string;
  roomName: (gameId: number) => string;
}) {
  const columns: Column<Vote>[] = [
    { key: "room", label: "Sala", render: (vote) => <strong>{roomName(vote.gameId)}</strong> },
    { key: "voter", label: "Votante", render: (vote) => playerName(vote.gameId, vote.voterId) },
    { key: "target", label: "Votou em", render: (vote) => playerName(vote.gameId, vote.targetPlayerId) },
    { key: "game", label: "Partida", render: (vote) => `#${vote.gameId}` },
    { key: "round", label: "Rodada", render: (vote) => vote.roundNumber },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => `${row.roundNumber}-${row.gameId}-${row.voterId}`}
      loading={loading}
      connected={connected}
      emptyMessage="Nenhum voto encontrado."
      page={page}
      lastPage={lastPage}
      onPageChange={onPageChange}
      filters={[
        { key: "room", label: "Sala", placeholder: "ID da sala", value: filters.roomId },
        { key: "voter", label: "Votante", placeholder: "ID do jogador", value: filters.voterId },
        { key: "target", label: "Alvo", placeholder: "ID do jogador", value: filters.targetId },
      ]}
      onFilterChange={onFilterChange}
    />
  );
}
