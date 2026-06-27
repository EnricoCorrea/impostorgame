"use client";

import { useCallback, useEffect, useState } from "react";
import { MessagesTable } from "@/components/data-table/messages-table";
import { MessageForm } from "@/components/forms/message-form";
import { ActionButton } from "@/components/ui/action-button";
import { Modal } from "@/components/ui/modal";
import { messagesService } from "@/services/messages.service";
import type { Message } from "@/types/api";

export default function MessagesPage() {
  const [rows, setRows] = useState<Message[]>([]);
  const [gameId, setGameId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<Message | null>(null);
  const [modal, setModal] = useState<"details" | "edit" | "delete" | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await messagesService.list({
        game_id: gameId ? Number(gameId) : undefined,
        player_id: playerId ? Number(playerId) : undefined,
        page,
        limit: 10,
      });
      setRows(result.data);
      setLastPage(result.meta.lastPage);
    } catch (err) {
      setLoadError(true);
      setNotice(err instanceof Error ? err.message : "Erro ao listar mensagens.");
    } finally {
      setLoading(false);
    }
  }, [gameId, playerId, page]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function openDetails(message: Message) {
    try {
      setSelected(await messagesService.get(message.id));
      setModal("details");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Mensagem nao encontrada.");
    }
  }

  async function remove() {
    if (!selected) return;
    try {
      await messagesService.remove(selected.id);
      setModal(null);
      setNotice("Mensagem excluida.");
      load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel excluir a mensagem.");
    }
  }

  function handleFilterChange(key: string, value: string) {
    const clean = value.replace(/\D/g, "");
    setPage(1);
    if (key === "game") setGameId(clean);
    if (key === "player") setPlayerId(clean);
  }

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">Mensagens</span>
          <h1>Mensagens</h1>
          <p>Liste, filtre, detalhe, envie, edite e exclua mensagens do chat.</p>
        </div>
      </header>
      <div className="split-layout">
        <MessageForm onSaved={() => { setNotice("Mensagem enviada."); load(); }} />
        <div>
          {notice && <div className="notice" onClick={() => setNotice("")}>{notice}<span>x</span></div>}
          <MessagesTable
            rows={rows}
            loading={loading}
            connected={!loadError}
            filters={{ gameId, playerId }}
            page={page}
            lastPage={lastPage}
            onPageChange={setPage}
            onFilterChange={handleFilterChange}
            actions={(message) => (
              <>
                <ActionButton variant="ghost" onClick={() => openDetails(message)}>Detalhes</ActionButton>
                <ActionButton variant="secondary" onClick={() => { setSelected(message); setModal("edit"); }}>Editar</ActionButton>
                <ActionButton variant="danger" onClick={() => { setSelected(message); setModal("delete"); }}>Excluir</ActionButton>
              </>
            )}
          />
        </div>
      </div>

      {modal === "details" && selected && (
        <Modal title={`Mensagem #${selected.id}`} onClose={() => setModal(null)}>
          <dl className="details">
            <div><dt>Mensagem</dt><dd>{selected.content}</dd></div>
            <div><dt>Partida</dt><dd>#{selected.gameId}</dd></div>
            <div><dt>Jogador</dt><dd>#{selected.playerId}</dd></div>
          </dl>
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Editar mensagem" onClose={() => setModal(null)}>
          <MessageForm message={selected} onSaved={() => { setModal(null); setNotice("Mensagem atualizada."); load(); }} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <Modal title="Excluir mensagem?" onClose={() => setModal(null)}>
          <div className="stack">
            <p>A mensagem <strong>#{selected.id}</strong> sera removida.</p>
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
