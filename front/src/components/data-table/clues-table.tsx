"use client";

import type { ReactNode } from "react";
import { DataTable, type Column } from "@/components/data-table/data-table";
import type { Clue } from "@/types/api";

export function CluesTable({
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
  rows: Clue[];
  loading: boolean;
  connected: boolean;
  filters: { gameId: string; clue: string };
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onFilterChange: (key: string, value: string) => void;
  actions: (clue: Clue) => ReactNode;
}) {
  const columns: Column<Clue>[] = [
    {
      key: "clue",
      label: "Dica",
      render: (item) => (
        <div>
          <strong>{item.clue}</strong>
          <small className="cell-subtitle">Dica #{item.id}</small>
        </div>
      ),
    },
    { key: "game", label: "Partida", render: (item) => <strong>#{item.gameId}</strong> },
    { key: "player", label: "Jogador", render: (item) => `#${item.playerId}` },
    { key: "round", label: "Rodada", render: (item) => item.roundNumber },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      loading={loading}
      connected={connected}
      emptyMessage="Nenhuma dica encontrada."
      page={page}
      lastPage={lastPage}
      onPageChange={onPageChange}
      filters={[
        { key: "game", label: "Filtrar partida", placeholder: "ID da partida", value: filters.gameId },
        { key: "clue", label: "Filtrar dica", placeholder: "Trecho da dica", value: filters.clue },
      ]}
      onFilterChange={onFilterChange}
      actions={actions}
    />
  );
}
