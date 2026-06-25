"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { WordForm } from "@/components/forms/word-form";
import { ActionButton } from "@/components/ui/action-button";
import { Modal } from "@/components/ui/modal";
import { wordsService } from "@/services/words.service";
import type { Word } from "@/types/api";

export default function WordsPage() {
  const [rows, setRows] = useState<Word[]>([]);
  const [word, setWord] = useState("");
  const [impostorClue, setImpostorClue] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<Word | null>(null);
  const [modal, setModal] = useState<"edit" | "delete" | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await wordsService.list({ word, impostorClue, page, limit: 10 });
      setRows(result.data);
      setLastPage(result.meta.lastPage);
    } catch (err) {
      setLoadError(true);
      setNotice(err instanceof Error ? err.message : "Erro ao listar palavras.");
    } finally {
      setLoading(false);
    }
  }, [word, impostorClue, page]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function remove() {
    if (!selected) return;
    try {
      await wordsService.remove(selected.id);
      setModal(null);
      setNotice("Palavra excluida.");
      load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Nao foi possivel excluir a palavra.");
    }
  }

  const columns: Column<Word>[] = [
    { key: "word", label: "Palavra", render: (item) => <strong>{item.word}</strong> },
    { key: "impostorClue", label: "Dica do impostor", render: (item) => item.impostorClue },
    { key: "id", label: "ID", render: (item) => `#${item.id}` },
  ];

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">Banco de palavras</span>
          <h1>Palavras</h1>
          <p>Cadastre, filtre, edite e exclua as palavras usadas nas partidas.</p>
        </div>
      </header>
      <div className="split-layout">
        <WordForm onSaved={() => { setNotice("Palavra cadastrada."); load(); }} />
        <div>
          {notice && <div className="notice" onClick={() => setNotice("")}>{notice}<span>x</span></div>}
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(row) => row.id}
            loading={loading}
            connected={!loadError}
            emptyMessage="Nenhuma palavra encontrada."
            page={page}
            lastPage={lastPage}
            onPageChange={setPage}
            filters={[
              { key: "word", label: "Filtrar palavra", placeholder: "Digite a palavra", value: word },
              { key: "clue", label: "Filtrar dica", placeholder: "Trecho da dica", value: impostorClue },
            ]}
            onFilterChange={(key, value) => {
              setPage(1);
              if (key === "word") setWord(value);
              else setImpostorClue(value);
            }}
            actions={(item) => (
              <>
                <ActionButton variant="secondary" onClick={() => { setSelected(item); setModal("edit"); }}>
                  Editar
                </ActionButton>
                <ActionButton variant="danger" onClick={() => { setSelected(item); setModal("delete"); }}>
                  Excluir
                </ActionButton>
              </>
            )}
          />
        </div>
      </div>
      {modal === "edit" && selected && (
        <Modal title="Editar palavra" onClose={() => setModal(null)}>
          <WordForm word={selected} onSaved={() => { setModal(null); setNotice("Palavra atualizada."); load(); }} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <Modal title="Excluir palavra?" onClose={() => setModal(null)}>
          <div className="stack">
            <p>A palavra <strong>{selected.word}</strong> sera removida.</p>
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
