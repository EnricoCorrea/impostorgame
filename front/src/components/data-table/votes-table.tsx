"use client";

import type { ReactNode } from "react";
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
  actions,
}: {
  rows: Vote[];
  loading: boolean;
  connected: boolean;
  filters: { gameId: string; voterId: string; targetId: string; roundNumber: string };
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onFilterChange: (key: string, value: string) => void;
  actions: (vote: Vote) => ReactNode;
}) {
  const columns: Column<Vote>[] = [
    { key: "game", label: "Partida", render: (vote) => <strong>#{vote.gameId}</strong> },
    { key: "voter", label: "Votante", render: (vote) => `Jogador #${vote.voterId}` },
    { key: "target", label: "Alvo", render: (vote) => vote.targetPlayerId ? `Jogador #${vote.targetPlayerId}` : "Sem alvo" },
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
        { key: "game", label: "Filtrar partida", placeholder: "ID da partida", value: filters.gameId },
        { key: "voter", label: "Filtrar votante", placeholder: "ID do jogador", value: filters.voterId },
        { key: "target", label: "Filtrar alvo", placeholder: "ID do jogador", value: filters.targetId },
        { key: "round", label: "Filtrar rodada", placeholder: "Numero da rodada", value: filters.roundNumber },
      ]}
      onFilterChange={onFilterChange}
      actions={actions}
    />
  );
}
