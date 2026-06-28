const roomChecks = [
  "Contas de jogadores prontas para entrar",
  "Salas com acesso controlado por convite",
  "Participantes organizados antes da rodada",
  "Perfis e permissoes revisados",
  "Administradores com acesso ao painel",
  "Historico de salas disponivel para consulta",
];

export default function DashboardPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">Visao geral</span>
          <h1>Controle da operacao do jogo</h1>
          <p>Monitore a preparacao das salas e mantenha os jogadores prontos para a proxima rodada.</p>
        </div>
        <span className="status-pill">Painel online</span>
      </header>

      <section className="stats">
        <article>
          <strong>Lobby</strong>
          <span>Salas e acessos prontos para organizar jogadores</span>
        </article>
        <article>
          <strong>Partidas</strong>
          <span>Rodadas, palavras e fases acompanhadas pelo painel</span>
        </article>
        <article>
          <strong>Jogo</strong>
          <span>Dicas, mensagens, votos e resultado integrados</span>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <span className="eyebrow">Preparacao</span>
          <h2>Jogadores, acessos e salas</h2>
          <ul className="check-list">
            {roomChecks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </article>

        <article className="panel accent-panel">
          <span className="eyebrow light">Rodada</span>
          <h2>Abra uma sala para os jogadores</h2>
          <p>Defina a sala, confirme os participantes e deixe tudo pronto antes de iniciar a partida.</p>
          <a href="/rooms" className="button button-light">
            Gerenciar salas
          </a>
        </article>
      </section>
    </>
  );
}
