"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";
import { BrandMark } from "@/components/layout/brand-mark";
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
        roomsService.list({ page: 1, limit: 12 }),
      ]);
      setMe(profile);
      setRooms(roomPage?.data ?? []);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel carregar salas.");
    } finally {
      setLoading(false);
    }
  }, [router]);

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
    <main className="player-page">
      <header className="player-topbar">
        <Link className="brand" href="/play"><BrandMark /><span>Impostor<strong>Game</strong></span></Link>
        <div className="player-account">
          <span>{me?.name ?? "Jogador"}</span>
          <button className="text-button" onClick={() => { authService.logout(); router.replace("/login"); }}>Sair</button>
        </div>
      </header>

      <section className="player-hero">
        <div>
          <span className="eyebrow">Jogar com amigos</span>
          <h1>Crie uma sala, envie o link e comece a suspeitar.</h1>
          <p>O fluxo de jogador fica aqui: lobby, palavra secreta, dicas por rodada, discussao em chat e votacao.</p>
        </div>
        <form className="quick-join" onSubmit={joinRoom}>
          <label>Codigo da sala<input value={roomCode} onChange={(event) => setRoomCode(event.target.value.replace(/\D/g, ""))} placeholder="Ex.: 12" /></label>
          <ActionButton type="submit">Entrar</ActionButton>
        </form>
      </section>

      {notice && <div className="notice" onClick={() => setNotice("")}>{notice}<span>x</span></div>}

      <section className="player-grid">
        <form className="play-panel" onSubmit={createRoom}>
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
          <div className="room-list">
            {loading ? <p className="empty-state">Carregando salas...</p> : rooms.length === 0 ? <p className="empty-state">Nenhuma sala disponivel.</p> : rooms.map((room) => (
              <article className="room-row" key={room.id}>
                <div><strong>{room.name}</strong><span>#{room.id} - {room.status} - ate {room.maxUsers}</span></div>
                <Link className="button button-secondary" href={`/play/${room.id}`}>Abrir</Link>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
