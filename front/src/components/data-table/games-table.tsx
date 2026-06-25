"use client";

import type { ReactNode } from "react";
import { DataTable, type Column } from "@/components/data-table/data-table";
import type { Game } from "@/types/api";

export function GamesTable({
  rows,
  loading,
  connected,
  roomId,
  roundNumber,
  page,
  lastPage,
  onPageChange,
  onFilterChange,
  actions,
}: {
  rows: Game[];
  loading: boolean;
  connected: boolean;
  roomId: string;
  roundNumber: string;
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onFilterChange: (key: string, value: string) => void;
  actions: (game: Game) => ReactNode;
}) {
  const columns: Column<Game>[] = [
    {
      key: "room",
      label: "Sala",
      render: (game) => (
        <div>
          <strong>{game.room?.name ?? `Sala #${game.roomId}`}</strong>
          <small className="cell-subtitle">Partida #{game.id}</small>
        </div>
      ),
    },
    { key: "status", label: "Fase", render: (game) => <span className={`badge badge-${game.status.toLowerCase()}`}>{game.status}</span> },
    { key: "round", label: "Rodada", render: (game) => game.roundNumber ?? 0 },
    { key: "winner", label: "Vencedor", render: (game) => game.winner ?? "Em aberto" },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      loading={loading}
      connected={connected}
      emptyMessage="Nenhuma partida encontrada."
      page={page}
      lastPage={lastPage}
      onPageChange={onPageChange}
      filters={[
        { key: "room", label: "Filtrar por sala", placeholder: "ID da sala", value: roomId },
        { key: "round", label: "Filtrar por rodada", placeholder: "Numero da rodada", value: roundNumber },
      ]}
      onFilterChange={onFilterChange}
      actions={actions}
    />
  );
}
