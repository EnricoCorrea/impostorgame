"use client";

import { useEffect, useState } from "react";
import { LiveGameBoard } from "@/components/live/live-game-board";
import { healthService } from "@/services/health.service";
import type { HealthStatus } from "@/types/api";

export default function LivePage() {
  const [notice, setNotice] = useState("");
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState("");

  useEffect(() => {
    healthService.check().then(setHealth).catch((err) => {
      setHealthError(err instanceof Error ? err.message : "API indisponivel.");
    });
  }, []);

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">Tempo real</span>
          <h1>Mesa ao vivo</h1>
          <p>Acompanhe uma sala e partida ja criadas, com estado, placar e acoes em tempo real.</p>
        </div>
        <span className={`live-indicator ${healthError ? "offline" : ""}`}><i /> {healthError || health?.status || "Verificando API"}</span>
      </header>
      {notice && <div className="notice" onClick={() => setNotice("")}>{notice}<span>x</span></div>}
      <LiveGameBoard onNotice={setNotice} />
    </>
  );
}
