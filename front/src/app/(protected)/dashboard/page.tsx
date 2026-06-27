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
          <strong>15</strong>
          <span>Controles ativos</span>
        </article>
        <article>
          <strong>3</strong>
          <span>Areas de gestao</span>
        </article>
        <article>
          <strong>47</strong>
          <span>Operacoes registradas</span>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <span className="eyebrow">Preparacao</span>
          <h2>Jogadores, acessos e salas</h2>
          <ul className="check-list">
            {roomChecks.map((check) => (
              <li key={check}>
                OK <span>{check}</span>
              </li>
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
