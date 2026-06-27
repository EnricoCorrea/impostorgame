"use client";

import type { ReactNode } from "react";
import { ActionButton } from "@/components/ui/action-button";

export interface Column<T> { key: string; label: string; render: (row: T) => ReactNode }
export interface FilterField { key: string; label: string; placeholder: string; value: string }

export function DataTable<T>({ rows, columns, rowKey, filters, onFilterChange, actions, loading, connected = true, emptyMessage, page, lastPage, onPageChange }:
  { rows: T[]; columns: Column<T>[]; rowKey: (row: T) => string | number; filters: FilterField[]; onFilterChange: (key: string, value: string) => void; actions?: (row: T) => ReactNode; loading?: boolean; connected?: boolean; emptyMessage: string; page: number; lastPage: number; onPageChange: (page: number) => void }) {
  return <section className="table-card">
    <div className="table-heading"><div><span className="eyebrow"></span><h2>Dados e ações</h2></div><span className={`live-indicator ${connected ? "" : "offline"}`}><i /> {connected ? "API conectada" : "Falha na consulta"}</span></div>
    <div className="filters">{filters.map((filter) => <label key={filter.key}>{filter.label}<input value={filter.value} placeholder={filter.placeholder} onChange={(e) => onFilterChange(filter.key, e.target.value)} /></label>)}</div>
    <div className="table-scroll"><table><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}{actions && <th>Ações</th>}</tr></thead>
      <tbody>{loading ? <tr><td colSpan={columns.length + 1} className="empty">Carregando…</td></tr> : rows.length === 0 ? <tr><td colSpan={columns.length + 1} className="empty">{emptyMessage}</td></tr> : rows.map((row) => <tr key={rowKey(row)}>{columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}{actions && <td><div className="row-actions">{actions(row)}</div></td>}</tr>)}</tbody>
    </table></div>
    <footer className="pagination"><span>Página {page} de {Math.max(lastPage, 1)}</span><div><ActionButton variant="ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Anterior</ActionButton><ActionButton variant="ghost" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>Próxima</ActionButton></div></footer>
  </section>;
}
