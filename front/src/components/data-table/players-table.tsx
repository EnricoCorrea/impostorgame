"use client";

import type { ReactNode } from "react";
import { DataTable, type Column } from "@/components/data-table/data-table";
import type { Player } from "@/types/api";

export function PlayersTable({
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
  rows: Player[];
  loading: boolean;
  connected: boolean;
  filters: { gameId: string; userId: string; wordId: string };
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onFilterChange: (key: string, value: string) => void;
  actions: (player: Player) => ReactNode;
}) {
  const columns: Column<Player>[] = [
    {
      key: "user",
      label: "Usuario",
      render: (player) => (
        <div>
          <strong>{player.user?.name ?? `Usuario #${player.userId}`}</strong>
          <small className="cell-subtitle">Jogador #{player.id}</small>
        </div>
      ),
    },
    { key: "game", label: "Partida", render: (player) => <strong>#{player.gameId}</strong> },
    { key: "word", label: "Palavra", render: (player) => player.word?.word ?? `#${player.wordId}` },
    { key: "role", label: "Papel", render: (player) => <span className={`badge ${player.role === "IMPOSTOR" ? "badge-purple" : ""}`}>{player.role}</span> },
    { key: "status", label: "Status", render: (player) => <span className={`badge ${player.isAlive ? "badge-playing" : "badge-closed"}`}>{player.isAlive ? "Vivo" : "Eliminado"}</span> },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      loading={loading}
      connected={connected}
      emptyMessage="Nenhum jogador encontrado."
      page={page}
      lastPage={lastPage}
      onPageChange={onPageChange}
      filters={[
        { key: "game", label: "Filtrar partida", placeholder: "ID da partida", value: filters.gameId },
        { key: "user", label: "Filtrar usuario", placeholder: "ID do usuario", value: filters.userId },
        { key: "word", label: "Filtrar palavra", placeholder: "ID da palavra", value: filters.wordId },
      ]}
      onFilterChange={onFilterChange}
      actions={actions}
    />
  );
}
