"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";
import { authService } from "@/services/auth.service";
import { roomsService } from "@/services/rooms.service";
import type { Room, User } from "@/types/api";

export default function PlayHomePage() {
  const router = useRouter();
  const [me, setMe] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState("Sala dos suspeitos");
  const [maxUsers, setMaxUsers] = useState(5);
  const [roomCode, setRoomCode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!authService.hasToken()) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    try {
      const [profile, roomPage] = await Promise.all([
        authService.me(),
        roomsService.list({ name: searchName.trim() || undefined, page, limit: 6 }),
      ]);
      setMe(profile);
      setRooms(roomPage?.data ?? []);
      setLastPage(roomPage?.meta.lastPage || 1);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel carregar salas.");
    } finally {
      setLoading(false);
    }
  }, [page, router, searchName]);

  useEffect(() => {
    load();
  }, [load]);

  async function createRoom(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setNotice("");
    try {
      const room = await roomsService.create({ name, maxUsers });
      router.push(`/play/${room.id}`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel criar a sala.");
    } finally {
      setCreating(false);
    }
  }

  async function joinRoom(event: FormEvent) {
    event.preventDefault();
    const id = Number(roomCode);
    if (!id) return setNotice("Informe o codigo da sala.");
    try {
      await roomsService.join(id);
      router.push(`/play/${id}`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel entrar na sala.");
    }
  }

  return (
    <main className="player-page play-home-page">
      <header className="player-topbar">
        <Link className="brand" href="/play"><span className="brand-mark">IG</span><span>Impostor<strong>Game</strong></span></Link>
        <div className="player-account">
          <span>{me?.name ?? "Jogador"}</span>
          <button className="text-button" onClick={() => { authService.logout(); router.replace("/login"); }}>Sair</button>
        </div>
      </header>

      <section className="player-hero">
        <div>
          <span className="eyebrow">Jogar com amigos</span>
          <h1>Salas de jogo</h1>
          <p>Crie uma sala, entre por codigo ou encontre uma partida aberta.</p>
        </div>
        <form className="quick-join" onSubmit={joinRoom}>
          <label>Codigo da sala<input value={roomCode} onChange={(event) => setRoomCode(event.target.value.replace(/\D/g, ""))} placeholder="Ex.: 12" /></label>
          <ActionButton type="submit">Entrar</ActionButton>
        </form>
      </section>

      {notice && <div className="notice" onClick={() => setNotice("")}>{notice}<span>x</span></div>}

      <section className="player-grid">
        <form className="play-panel create-room-panel" onSubmit={createRoom}>
          <div>
            <span className="eyebrow">Nova sala</span>
            <h2>Preparar partida</h2>
          </div>
          <label>Nome da sala<input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} /></label>
          <label>Limite de jogadores<select value={maxUsers} onChange={(event) => setMaxUsers(Number(event.target.value))}>{[3, 4, 5].map((value) => <option key={value} value={value}>{value} jogadores</option>)}</select></label>
          <ActionButton type="submit" loading={creating}>Criar sala</ActionButton>
        </form>

        <section className="play-panel room-list-panel">
          <div className="panel-title-row">
            <div><span className="eyebrow">Salas abertas</span><h2>Entrar rapido</h2></div>
            <button className="text-button" onClick={load} disabled={loading}>Atualizar</button>
          </div>

          <form className="room-search" onSubmit={(event) => { event.preventDefault(); setPage(1); load(); }}>
            <input value={searchName} onChange={(event) => { setPage(1); setSearchName(event.target.value); }} placeholder="Buscar sala por nome" />
          </form>

          <div className="room-list">
            {loading ? <p className="empty-state">Carregando salas...</p> : rooms.length === 0 ? <p className="empty-state">Nenhuma sala disponivel.</p> : rooms.map((room) => (
              <article className="room-row" key={room.id}>
                <div><strong>{room.name}</strong><span>#{room.id} - {room.status} - ate {room.maxUsers}</span></div>
                <Link className="button button-secondary" href={`/play/${room.id}`}>Abrir</Link>
              </article>
            ))}
          </div>

          <div className="room-pagination">
            <ActionButton variant="ghost" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={loading || page <= 1}>Anterior</ActionButton>
            <span>Pagina {page} de {lastPage}</span>
            <ActionButton variant="ghost" onClick={() => setPage((current) => Math.min(lastPage, current + 1))} disabled={loading || page >= lastPage}>Proxima</ActionButton>
          </div>
        </section>
      </section>
    </main>
  );
}