"use client";

import { useCallback, useEffect, useState } from "react";
import { PlayersTable } from "@/components/data-table/players-table";
import { PlayerForm } from "@/components/forms/player-form";
import { ActionButton } from "@/components/ui/action-button";
import { Modal } from "@/components/ui/modal";
import { playersService } from "@/services/players.service";
import type { Player } from "@/types/api";

export default function PlayersPage() {
  const [rows, setRows] = useState<Player[]>([]);
  const [gameId, setGameId] = useState("");
  const [userId, setUserId] = useState("");
  const [wordId, setWordId] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<Player | null>(null);
  const [modal, setModal] = useState<"details" | "edit" | "delete" | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await playersService.list({
        game_id: gameId ? Number(gameId) : undefined,
        user_id: userId ? Number(userId) : undefined,
        word_id: wordId ? Number(wordId) : undefined,
        page,
        limit: 10,
      });
      setRows(result.data);
      setLastPage(result.meta.lastPage);
    } catch (err) {
      setLoadError(true);
      setNotice(err instanceof Error ? err.message : "Erro ao listar jogadores.");
    } finally {
      setLoading(false);
    }
  }, [gameId, userId, wordId, page]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function openDetails(player: Player) {
    try {
      setSelected(await playersService.get(player.id));
      setModal("details");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Jogador nao encontrado.");
    }
  }

  async function remove() {
    if (!selected) return;
    try {
      await playersService.remove(selected.id);
      setModal(null);
      setNotice("Jogador excluido.");
      load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel excluir o jogador.");
    }
  }

  function handleFilterChange(key: string, value: string) {
    const clean = value.replace(/\D/g, "");
    setPage(1);
    if (key === "game") setGameId(clean);
    if (key === "user") setUserId(clean);
    if (key === "word") setWordId(clean);
  }

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">Jogadores</span>
          <h1>Jogadores</h1>
          <p>Liste, filtre, detalhe, cadastre, edite e exclua jogadores das partidas.</p>
        </div>
      </header>
      <div className="split-layout">
        <PlayerForm onSaved={() => { setNotice("Jogador cadastrado."); load(); }} />
        <div>
          {notice && <div className="notice" onClick={() => setNotice("")}>{notice}<span>x</span></div>}
          <PlayersTable
            rows={rows}
            loading={loading}
            connected={!loadError}
            filters={{ gameId, userId, wordId }}
            page={page}
            lastPage={lastPage}
            onPageChange={setPage}
            onFilterChange={handleFilterChange}
            actions={(player) => (
              <>
                <ActionButton variant="ghost" onClick={() => openDetails(player)}>Detalhes</ActionButton>
                <ActionButton variant="secondary" onClick={() => { setSelected(player); setModal("edit"); }}>Editar</ActionButton>
                <ActionButton variant="danger" onClick={() => { setSelected(player); setModal("delete"); }}>Excluir</ActionButton>
              </>
            )}
          />
        </div>
      </div>

      {modal === "details" && selected && (
        <Modal title={`Jogador #${selected.id}`} onClose={() => setModal(null)}>
          <dl className="details">
            <div><dt>Partida</dt><dd>#{selected.gameId}</dd></div>
            <div><dt>Usuario</dt><dd>{selected.user?.name ?? `#${selected.userId}`}</dd></div>
            <div><dt>Palavra</dt><dd>{selected.word?.word ?? `#${selected.wordId}`}</dd></div>
            <div><dt>Papel</dt><dd>{selected.role}</dd></div>
            <div><dt>Status</dt><dd>{selected.isAlive ? "Vivo" : "Eliminado"}</dd></div>
          </dl>
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Editar jogador" onClose={() => setModal(null)}>
          <PlayerForm player={selected} onSaved={() => { setModal(null); setNotice("Jogador atualizado."); load(); }} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <Modal title="Excluir jogador?" onClose={() => setModal(null)}>
          <div className="stack">
            <p>O jogador <strong>#{selected.id}</strong> sera removido da partida <strong>#{selected.gameId}</strong>.</p>
            <div className="modal-actions">
              <ActionButton variant="ghost" onClick={() => setModal(null)}>Cancelar</ActionButton>
              <ActionButton variant="danger" onClick={remove}>Confirmar exclusao</ActionButton>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
