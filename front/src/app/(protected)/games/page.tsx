"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { GamesTable } from "@/components/data-table/games-table";
import { StartGameButton } from "@/components/ui/start-game-button";
import { ActionButton } from "@/components/ui/action-button";
import { Modal } from "@/components/ui/modal";
import { gamesService } from "@/services/games.service";
import type { Game, GamePrivateState, GameStatus } from "@/types/api";

const statuses: GameStatus[] = ["WAITING", "CLUE", "DISCUSSING", "VOTING"];

export default function GamesPage() {
  const [rows, setRows] = useState<Game[]>([]);
  const [roomId, setRoomId] = useState("");
  const [roundNumber, setRoundNumber] = useState("");
  const [createRoomId, setCreateRoomId] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<Game | null>(null);
  const [privateState, setPrivateState] = useState<GamePrivateState | null>(null);
  const [modal, setModal] = useState<"details" | "state" | "vote" | "edit" | "delete" | null>(null);
  const [voteTarget, setVoteTarget] = useState("");
  const [editRoomId, setEditRoomId] = useState("");
  const [editStatus, setEditStatus] = useState<GameStatus>("WAITING");
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await gamesService.list({
        room_id: roomId ? Number(roomId) : undefined,
        round_number: roundNumber ? Number(roundNumber) : undefined,
        page,
        limit: 10,
      });
      setRows(result.data);
      setLastPage(result.meta.lastPage);
    } catch (err) {
      setLoadError(true);
      setNotice(err instanceof Error ? err.message : "Erro ao listar partidas.");
    } finally {
      setLoading(false);
    }
  }, [roomId, roundNumber, page]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function createGame(event: FormEvent) {
    event.preventDefault();
    if (!createRoomId) return setNotice("Informe o ID da sala para criar a partida.");
    setFormLoading(true);
    try {
      await gamesService.create(Number(createRoomId));
      setCreateRoomId("");
      setNotice("Partida criada.");
      load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel criar a partida.");
    } finally {
      setFormLoading(false);
    }
  }

  async function openDetails(game: Game) {
    try {
      setSelected(await gamesService.get(game.id));
      setModal("details");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Partida nao encontrada.");
    }
  }

  async function openState(game: Game) {
    try {
      setSelected(game);
      setPrivateState(await gamesService.state(game.id));
      setModal("state");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Estado privado indisponivel.");
    }
  }

  function openEdit(game: Game) {
    setSelected(game);
    setEditRoomId(String(game.roomId));
    setEditStatus(game.status);
    setModal("edit");
  }

  async function vote(event: FormEvent) {
    event.preventDefault();
    if (!selected || !voteTarget) return;
    setFormLoading(true);
    try {
      await gamesService.vote(selected.id, Number(voteTarget));
      setVoteTarget("");
      setModal(null);
      setNotice("Voto registrado.");
      load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel votar.");
    } finally {
      setFormLoading(false);
    }
  }

  async function updateGame(event: FormEvent) {
    event.preventDefault();
    if (!selected || !editRoomId) return;
    setFormLoading(true);
    try {
      await gamesService.update(selected.id, { roomId: Number(editRoomId), status: editStatus });
      setModal(null);
      setNotice("Partida atualizada.");
      load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel editar a partida.");
    } finally {
      setFormLoading(false);
    }
  }

  async function remove() {
    if (!selected) return;
    try {
      await gamesService.remove(selected.id);
      setModal(null);
      setNotice("Partida excluida.");
      load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel excluir a partida.");
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">Partidas</span>
          <h1>Partidas</h1>
          <p>Crie, inicie, consulte estado privado, vote e mantenha partidas.</p>
        </div>
      </header>
      <div className="split-layout">
        <form className="form-card" onSubmit={createGame} noValidate>
          <div>
            <span className="eyebrow">Criar partida</span>
            <h2>Nova partida</h2>
            <p>Use uma sala existente com jogadores e palavras cadastradas.</p>
          </div>
          <label>
            ID da sala
            <input value={createRoomId} onChange={(event) => setCreateRoomId(event.target.value.replace(/\D/g, ""))} placeholder="Ex.: 1" />
          </label>
          <ActionButton type="submit" loading={formLoading}>
            Criar partida
          </ActionButton>
        </form>
        <div>
          {notice && <div className="notice" onClick={() => setNotice("")}>{notice}<span>x</span></div>}
          <GamesTable
            rows={rows}
            loading={loading}
            connected={!loadError}
            roomId={roomId}
            roundNumber={roundNumber}
            page={page}
            lastPage={lastPage}
            onPageChange={setPage}
            onFilterChange={(key, value) => {
              setPage(1);
              if (key === "room") setRoomId(value.replace(/\D/g, ""));
              else setRoundNumber(value.replace(/\D/g, ""));
            }}
            actions={(game) => (
              <>
                <ActionButton variant="ghost" onClick={() => openDetails(game)}>Detalhes</ActionButton>
                <StartGameButton gameId={game.id} onStarted={(message) => { setNotice(message); load(); }} />
                <ActionButton variant="ghost" onClick={() => openState(game)}>Estado</ActionButton>
                <ActionButton variant="secondary" onClick={() => { setSelected(game); setModal("vote"); }}>Votar</ActionButton>
                <ActionButton variant="ghost" onClick={() => openEdit(game)}>Editar</ActionButton>
                <ActionButton variant="danger" onClick={() => { setSelected(game); setModal("delete"); }}>Excluir</ActionButton>
              </>
            )}
          />
        </div>
      </div>

      {modal === "details" && selected && (
        <Modal title={`Partida #${selected.id}`} onClose={() => setModal(null)}>
          <dl className="details">
            <div><dt>Sala</dt><dd>{selected.room?.name ?? `#${selected.roomId}`}</dd></div>
            <div><dt>Status</dt><dd>{selected.status}</dd></div>
            <div><dt>Rodada</dt><dd>{selected.roundNumber ?? 0}</dd></div>
            <div><dt>Vencedor</dt><dd>{selected.winner ?? "Em aberto"}</dd></div>
          </dl>
        </Modal>
      )}
      {modal === "state" && selected && privateState && (
        <Modal title={`Estado privado #${selected.id}`} onClose={() => setModal(null)}>
          <dl className="details">
            <div><dt>Meu papel</dt><dd>{privateState.myRole ?? "Nao definido"}</dd></div>
            <div><dt>Fase</dt><dd>{privateState.status}</dd></div>
            <div><dt>Rodada</dt><dd>{privateState.round}</dd></div>
            <div><dt>Jogadores</dt><dd>{privateState.players.map((player) => `#${player.id} ${player.isAlive ? "vivo" : "fora"}`).join(", ") || "Nenhum"}</dd></div>
          </dl>
        </Modal>
      )}
      {modal === "vote" && selected && (
        <Modal title="Registrar voto" onClose={() => setModal(null)}>
          <form className="stack" onSubmit={vote}>
            <label>
              ID do jogador alvo
              <input value={voteTarget} onChange={(event) => setVoteTarget(event.target.value.replace(/\D/g, ""))} placeholder="Ex.: 3" />
            </label>
            <ActionButton type="submit" loading={formLoading}>Votar</ActionButton>
          </form>
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Editar partida" onClose={() => setModal(null)}>
          <form className="stack" onSubmit={updateGame}>
            <label>ID da sala<input value={editRoomId} onChange={(event) => setEditRoomId(event.target.value.replace(/\D/g, ""))} /></label>
            <label>Status<select value={editStatus} onChange={(event) => setEditStatus(event.target.value as GameStatus)}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            <ActionButton type="submit" loading={formLoading}>Salvar partida</ActionButton>
          </form>
        </Modal>
      )}
      {modal === "delete" && selected && (
        <Modal title="Excluir partida?" onClose={() => setModal(null)}>
          <div className="stack">
            <p>A partida <strong>#{selected.id}</strong> sera removida.</p>
            <div className="modal-actions">
              <ActionButton variant="ghost" onClick={() => setModal(null)}>Cancelar</ActionButton>
              <ActionButton variant="danger" onClick={remove}>Excluir definitivamente</ActionButton>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
