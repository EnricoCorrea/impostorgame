"use client";

import { useState, type FormEvent } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { wordsService } from "@/services/words.service";
import type { Word } from "@/types/api";

export function WordForm({ word, onSaved }: { word?: Word; onSaved: () => void }) {
  const [value, setValue] = useState(word?.word ?? "");
  const [impostorClue, setImpostorClue] = useState(word?.impostorClue ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (value.trim().length < 2) return setError("Informe uma palavra com pelo menos 2 caracteres.");
    if (impostorClue.trim().length < 3) return setError("Informe uma dica para o impostor.");
    setLoading(true);
    try {
      const data = { word: value.trim(), impostorClue: impostorClue.trim() };
      if (word) await wordsService.update(word.id, data);
      else await wordsService.create(data);
      if (!word) {
        setValue("");
        setImpostorClue("");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar palavra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={word ? "stack" : "form-card"} onSubmit={submit} noValidate>
      {!word && (
        <div>
          <span className="eyebrow">Banco de palavras</span>
          <h2>Cadastrar palavra</h2>
          <p>Palavras alimentam o sorteio usado ao criar partidas.</p>
        </div>
      )}
      <label>
        Palavra
        <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ex.: Praia" maxLength={80} />
      </label>
      <label>
        Dica do impostor
        <input
          value={impostorClue}
          onChange={(event) => setImpostorClue(event.target.value)}
          placeholder="Ex.: Lugar quente com areia"
          maxLength={140}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <ActionButton loading={loading} type="submit">
        {word ? "Salvar alteracoes" : "Cadastrar palavra"}
      </ActionButton>
    </form>
  );
}
