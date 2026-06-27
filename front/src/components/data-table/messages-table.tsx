"use client";

import type { ReactNode } from "react";
import { DataTable, type Column } from "@/components/data-table/data-table";
import type { Message } from "@/types/api";

export function MessagesTable({
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
  rows: Message[];
  loading: boolean;
  connected: boolean;
  filters: { gameId: string; playerId: string };
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onFilterChange: (key: string, value: string) => void;
  actions: (message: Message) => ReactNode;
}) {
  const columns: Column<Message>[] = [
    {
      key: "content",
      label: "Mensagem",
      render: (message) => (
        <div>
          <strong>{message.content}</strong>
          <small className="cell-subtitle">Mensagem #{message.id}</small>
        </div>
      ),
    },
    { key: "game", label: "Partida", render: (message) => <strong>#{message.gameId}</strong> },
    { key: "player", label: "Jogador", render: (message) => `#${message.playerId}` },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      loading={loading}
      connected={connected}
      emptyMessage="Nenhuma mensagem encontrada."
      page={page}
      lastPage={lastPage}
      onPageChange={onPageChange}
      filters={[
        { key: "game", label: "Filtrar partida", placeholder: "ID da partida", value: filters.gameId },
        { key: "player", label: "Filtrar jogador", placeholder: "ID do jogador", value: filters.playerId },
      ]}
      onFilterChange={onFilterChange}
      actions={actions}
    />
  );
}
