"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { ActionButton } from "@/components/ui/action-button";
import { Modal } from "@/components/ui/modal";
import { UserForm } from "@/components/forms/user-form";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@impostor.local");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [register, setRegister] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.login(email, password);
      const me = await authService.me();
      router.push(me.role === "ADMIN" ? "/dashboard" : "/play");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="brand brand-light">
          <span className="brand-mark">IG</span>
          <span>Impostor<strong>Game</strong></span>
        </div>
        <div className="art-copy">
          <span className="eyebrow light">Descubra. Desconfie. Divirta-se.</span>
          <h1>Todo mundo sabe a palavra.<br /><em>Menos um.</em></h1>
          <p>Gerencie salas, reuna o grupo e descubra quem esta improvisando antes que seja tarde.</p>
        </div>
        <div className="orb orb-one" />
        <div className="orb orb-two" />
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={submit} noValidate>
          <div>
            <span className="eyebrow">Bem-vindo de volta</span>
            <h2>Entre na sua conta</h2>
            <p>Use suas credenciais para acessar o painel.</p>
          </div>

          <label>
            E-mail
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label>
            Senha
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>

          {error && <p className="form-error">{error}</p>}

          <ActionButton loading={loading} type="submit">Entrar no jogo -&gt;</ActionButton>
          <button className="text-button" type="button" onClick={() => setRegister(true)}>Ainda nao tenho uma conta</button>
        </form>
      </section>

      {register && (
        <Modal title="Criar conta" onClose={() => setRegister(false)}>
          <UserForm onSaved={() => setRegister(false)} />
        </Modal>
      )}
    </main>
  );
}