"use client";

import { useCallback, useEffect, useState } from "react";
import { VotesTable } from "@/components/data-table/votes-table";
import { VoteForm } from "@/components/forms/vote-form";
import { ActionButton } from "@/components/ui/action-button";
import { Modal } from "@/components/ui/modal";
import { votesService } from "@/services/votes.service";
import type { Vote } from "@/types/api";

export default function VotesPage() {
  const [rows, setRows] = useState<Vote[]>([]);
  const [gameId, setGameId] = useState("");
  const [voterId, setVoterId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [roundNumber, setRoundNumber] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<Vote | null>(null);
  const [modal, setModal] = useState<"details" | "edit" | "delete" | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await votesService.list({
        game_id: gameId ? Number(gameId) : undefined,
        voter_id: voterId ? Number(voterId) : undefined,
        target_player_id: targetId ? Number(targetId) : undefined,
        page,
        limit: 10,
      });
      setRows(roundNumber ? result.data.filter((vote) => vote.roundNumber === Number(roundNumber)) : result.data);
      setLastPage(result.meta.lastPage);
    } catch (err) {
      setLoadError(true);
      setNotice(err instanceof Error ? err.message : "Erro ao listar votos.");
    } finally {
      setLoading(false);
    }
  }, [gameId, voterId, targetId, roundNumber, page]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function openDetails(vote: Vote) {
    try {
      setSelected(await votesService.get(vote.roundNumber, vote.gameId, vote.voterId));
      setModal("details");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Voto nao encontrado.");
    }
  }

  async function remove() {
    if (!selected) return;
    try {
      await votesService.remove(selected.roundNumber, selected.gameId, selected.voterId);
      setModal(null);
      setNotice("Voto excluido.");
      load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel excluir o voto.");
    }
  }

  function handleFilterChange(key: string, value: string) {
    const clean = value.replace(/\D/g, "");
    setPage(1);
    if (key === "game") setGameId(clean);
    if (key === "voter") setVoterId(clean);
    if (key === "target") setTargetId(clean);
    if (key === "round") setRoundNumber(clean);
  }

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">Votacao</span>
          <h1>Votos</h1>
          <p>Liste, filtre, detalhe, cadastre, edite e exclua votos administrativos.</p>
        </div>
      </header>
      <div className="split-layout">
        <VoteForm onSaved={() => { setNotice("Voto cadastrado."); load(); }} />
        <div>
          {notice && <div className="notice" onClick={() => setNotice("")}>{notice}<span>x</span></div>}
          <VotesTable
            rows={rows}
            loading={loading}
            connected={!loadError}
            filters={{ gameId, voterId, targetId, roundNumber }}
            page={page}
            lastPage={lastPage}
            onPageChange={setPage}
            onFilterChange={handleFilterChange}
            actions={(vote) => (
              <>
                <ActionButton variant="ghost" onClick={() => openDetails(vote)}>Detalhes</ActionButton>
                <ActionButton variant="secondary" onClick={() => { setSelected(vote); setModal("edit"); }}>Editar</ActionButton>
                <ActionButton variant="danger" onClick={() => { setSelected(vote); setModal("delete"); }}>Excluir</ActionButton>
              </>
            )}
          />
        </div>
      </div>

      {modal === "details" && selected && (
        <Modal title={`Voto ${selected.roundNumber}/${selected.gameId}/${selected.voterId}`} onClose={() => setModal(null)}>
          <dl className="details">
            <div><dt>Partida</dt><dd>#{selected.gameId}</dd></div>
            <div><dt>Votante</dt><dd>Jogador #{selected.voterId}</dd></div>
            <div><dt>Alvo</dt><dd>{selected.targetPlayerId ? `Jogador #${selected.targetPlayerId}` : "Sem alvo"}</dd></div>
            <div><dt>Rodada</dt><dd>{selected.roundNumber}</dd></div>
          </dl>
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Editar voto" onClose={() => setModal(null)}>
          <VoteForm vote={selected} onSaved={() => { setModal(null); setNotice("Voto atualizado."); load(); }} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <Modal title="Excluir voto?" onClose={() => setModal(null)}>
          <div className="stack">
            <p>O voto da rodada <strong>{selected.roundNumber}</strong> sera removido.</p>
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
