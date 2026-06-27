"use client";

import { useCallback, useEffect, useState } from "react";
import { CluesTable } from "@/components/data-table/clues-table";
import { ClueForm } from "@/components/forms/clue-form";
import { ActionButton } from "@/components/ui/action-button";
import { Modal } from "@/components/ui/modal";
import { cluesService } from "@/services/clues.service";
import type { Clue } from "@/types/api";

export default function CluesPage() {
  const [rows, setRows] = useState<Clue[]>([]);
  const [gameId, setGameId] = useState("");
  const [clueText, setClueText] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<Clue | null>(null);
  const [modal, setModal] = useState<"details" | "edit" | "delete" | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await cluesService.list({
        game_id: gameId ? Number(gameId) : undefined,
        clue: clueText,
        page,
        limit: 10,
      });
      setRows(result.data);
      setLastPage(result.meta.lastPage);
    } catch (err) {
      setLoadError(true);
      setNotice(err instanceof Error ? err.message : "Erro ao listar dicas.");
    } finally {
      setLoading(false);
    }
  }, [gameId, clueText, page]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function openDetails(clue: Clue) {
    try {
      setSelected(await cluesService.get(clue.id));
      setModal("details");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Dica nao encontrada.");
    }
  }

  async function remove() {
    if (!selected) return;
    try {
      await cluesService.remove(selected.id);
      setModal(null);
      setNotice("Dica excluida.");
      load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel excluir a dica.");
    }
  }

  function handleFilterChange(key: string, value: string) {
    setPage(1);
    if (key === "game") setGameId(value.replace(/\D/g, ""));
    if (key === "clue") setClueText(value);
  }

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">Dicas</span>
          <h1>Dicas</h1>
          <p>Liste, filtre, detalhe, envie, edite e exclua dicas das rodadas.</p>
        </div>
      </header>
      <div className="split-layout">
        <ClueForm onSaved={() => { setNotice("Dica enviada."); load(); }} />
        <div>
          {notice && <div className="notice" onClick={() => setNotice("")}>{notice}<span>x</span></div>}
          <CluesTable
            rows={rows}
            loading={loading}
            connected={!loadError}
            filters={{ gameId, clue: clueText }}
            page={page}
            lastPage={lastPage}
            onPageChange={setPage}
            onFilterChange={handleFilterChange}
            actions={(clue) => (
              <>
                <ActionButton variant="ghost" onClick={() => openDetails(clue)}>Detalhes</ActionButton>
                <ActionButton variant="secondary" onClick={() => { setSelected(clue); setModal("edit"); }}>Editar</ActionButton>
                <ActionButton variant="danger" onClick={() => { setSelected(clue); setModal("delete"); }}>Excluir</ActionButton>
              </>
            )}
          />
        </div>
      </div>

      {modal === "details" && selected && (
        <Modal title={`Dica #${selected.id}`} onClose={() => setModal(null)}>
          <dl className="details">
            <div><dt>Dica</dt><dd>{selected.clue}</dd></div>
            <div><dt>Partida</dt><dd>#{selected.gameId}</dd></div>
            <div><dt>Jogador</dt><dd>#{selected.playerId}</dd></div>
            <div><dt>Rodada</dt><dd>{selected.roundNumber}</dd></div>
          </dl>
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Editar dica" onClose={() => setModal(null)}>
          <ClueForm clue={selected} onSaved={() => { setModal(null); setNotice("Dica atualizada."); load(); }} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <Modal title="Excluir dica?" onClose={() => setModal(null)}>
          <div className="stack">
            <p>A dica <strong>{selected.clue}</strong> sera removida.</p>
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
