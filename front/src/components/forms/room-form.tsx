"use client";

import { useState } from "react";
import { roomsService } from "@/services/rooms.service";
import { ActionButton } from "@/components/ui/action-button";

export function RoomForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [maxUsers, setMaxUsers] = useState(5);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 3) return setError("O nome precisa ter pelo menos 3 caracteres.");
    if (maxUsers < 3 || maxUsers > 5) return setError("A sala deve aceitar entre 3 e 5 jogadores.");
    setLoading(true); setError("");
    try {
      await roomsService.create({ name: name.trim(), maxUsers });
      setName(""); setMaxUsers(5); onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a sala.");
    } finally { setLoading(false); }
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      <div><span className="eyebrow">Componente médio</span><h2>Criar uma sala</h2><p>Você será definido como anfitrião automaticamente.</p></div>
      <label>Nome da sala<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Mistério de sexta" maxLength={100} /></label>
      <label>Máximo de jogadores<select value={maxUsers} onChange={(e) => setMaxUsers(Number(e.target.value))}><option value={3}>3 jogadores</option><option value={4}>4 jogadores</option><option value={5}>5 jogadores</option></select></label>
      {error && <p className="form-error">{error}</p>}
      <ActionButton loading={loading} type="submit">Criar sala</ActionButton>
    </form>
  );
}
