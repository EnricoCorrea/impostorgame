"use client";

import { useState } from "react";
import { usersService } from "@/services/users.service";
import { ActionButton } from "@/components/ui/action-button";
import type { User } from "@/types/api";

export function UserForm({ user, onSaved }: { user?: User; onSaved: () => void }) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (name.trim().length < 2) return setError("Informe um nome válido.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Informe um e-mail válido.");
    if (!user && password.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");
    setLoading(true);
    try {
      if (user) await usersService.update(user.id, { name, email, ...(password ? { password } : {}) });
      else await usersService.create({ name, email, password });
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao salvar usuário."); }
    finally { setLoading(false); }
  }

  return <form className="stack" onSubmit={submit} noValidate>
    <label>Nome<input value={name} onChange={(e) => setName(e.target.value)} /></label>
    <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
    <label>{user ? "Nova senha (opcional)" : "Senha"}<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
    {error && <p className="form-error">{error}</p>}
    <ActionButton type="submit" loading={loading}>{user ? "Salvar alterações" : "Criar conta"}</ActionButton>
  </form>;
}
