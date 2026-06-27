# Impostor Game

Aplicacao full stack para gerenciar e jogar partidas do Impostor Game. O projeto tem uma API em NestJS, banco PostgreSQL e um painel web em Next.js.

## Tecnologias

- Backend: Node.js, NestJS, Sequelize, PostgreSQL, JWT, Swagger e Socket.IO
- Frontend: Next.js, React, TypeScript, Tailwind CSS e Socket.IO Client
- Banco: PostgreSQL

## Estrutura

```txt
impostorgame/
  back/   API NestJS, WebSocket, regras do jogo e acesso ao banco
  front/  Aplicacao web Next.js
```

## Funcionalidades

- Login com JWT e controle de acesso por perfil
- Gerenciamento de usuarios, salas, partidas, jogadores, palavras, dicas, mensagens e votos
- Fluxo de jogo com sala, partida, palavra secreta, impostor, dicas, discussao, votacao e resultado
- Paginas de jogador para criar/entrar em sala e jogar
- Painel administrativo com listagens, filtros, formularios e detalhes
- Mesa ao vivo para acompanhar uma sala pelo ID, vendo fase, jogadores, palavra, dicas, chat e placar
- Pagina de votos registrados, com filtros por sala, votante e alvo
- Swagger da API em `/api`

## Requisitos

- Node.js
- PostgreSQL
- npm

## Configuracao do Backend

Entre na pasta do backend:

```bash
cd back
npm install
```

Crie `back/.env` com base em `back/.env.example`:

```env
PORT=3001
CORS_ORIGIN=*
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=impostor_game
DB_SYNC=false
JWT_SECRET=troque-por-uma-chave-longa-e-aleatoria
JWT_EXPIRES_IN=1d
```

Para desenvolvimento:

```bash
npm run start:dev
```

Para build e execucao em producao:

```bash
npm run build
npm run start:prod
```

A API fica em:

```txt
http://localhost:3001
```

Swagger:

```txt
http://localhost:3001/api
```

## Configuracao do Frontend

Entre na pasta do frontend:

```bash
cd front
npm install
```

Crie `front/.env` com base em `front/.env.example`:

```env
API_PROXY_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
```

Para desenvolvimento:

```bash
npm run dev
```

Para build e execucao em producao:

```bash
npm run build
npm start
```

O frontend fica em:

```txt
http://localhost:3000
```

Observacao: `npm start` no Next.js usa o build ja gerado. Depois de alterar codigo, rode `npm run build` antes de iniciar com `npm start`.

## Executando com Docker

O projeto tambem pode subir com Docker Compose. A composicao cria:

- `db`: PostgreSQL
- `back`: API NestJS em `http://localhost:3001`
- `front`: Next.js em `http://localhost:3000`

Antes de rodar, deixe o Docker Desktop aberto e com o engine Linux ativo.

Na raiz do projeto, rode:

```bash
docker compose up --build
```

Para rodar em segundo plano:

```bash
docker compose up --build -d
```

Para parar:

```bash
docker compose down
```

Para remover tambem o volume do banco:

```bash
docker compose down -v
```

No Docker Compose, o backend acessa o PostgreSQL usando `DB_HOST=db`. O frontend usa o proxy `/api` para chamadas HTTP e `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001` para WebSocket.

Por padrao, o `docker-compose.yml` usa `DB_SYNC=true` para facilitar o ambiente local criando/sincronizando as tabelas pelo Sequelize. Em producao, prefira `DB_SYNC=false` e migre o banco de forma controlada.

## Fluxo Basico do Jogo

1. Criar usuario ou entrar com uma conta existente.
2. Criar uma sala.
3. Jogadores entram na sala.
4. O anfitriao cria/inicia a partida.
5. O sistema cria os jogadores da partida e sorteia a palavra.
6. Jogadores enviam dicas.
7. A partida entra em discussao.
8. Jogadores votam em quem acreditam ser o impostor.
9. O jogo elimina jogadores ou finaliza com vencedor.

## Principais Telas do Frontend

- `Dashboard`: visao geral operacional do painel.
- `Usuarios`: cadastro, edicao, filtros e listagem de usuarios.
- `Salas`: criacao, entrada, saida e consulta de salas.
- `Partidas`: criacao, inicio, estado privado, voto e manutencao de partidas.
- `Jogadores`: listagem e administracao de jogadores vinculados a partidas.
- `Palavras`: cadastro e manutencao de palavras e pistas do impostor.
- `Dicas`: consulta e manutencao das dicas enviadas por rodada.
- `Mensagens`: consulta e manutencao do chat das partidas.
- `Votos`: listagem simples dos votos existentes no banco, mostrando sala, votante, alvo, partida e rodada.
- `Ao vivo`: board de acompanhamento por ID da sala, com fase, palavra, jogadores, dicas, chat e placar.
- `Play`: experiencia do jogador para criar/entrar em sala e participar da partida.

## Componentes Importantes do Frontend

- `DataTable`: tabela reutilizavel com filtros, paginacao e acoes.
- `VotesTable`: tabela especifica da pagina de votos.
- `LiveGameBoard`: board de acompanhamento da pagina Ao Vivo.
- `ActionButton`: botao com suporte a loading e variantes.
- `Modal`: componente de modal usado nas telas administrativas.
- `AppShell`: layout protegido com menu lateral.
- `BrandMark`: icone/marca da aplicacao.

## Servicos do Frontend

Os servicos ficam em `front/src/services` e centralizam chamadas HTTP:

- `authService`
- `usersService`
- `roomsService`
- `gamesService`
- `playersService`
- `wordsService`
- `cluesService`
- `messagesService`
- `votesService`
- `healthService`
- `createLiveGameSocket`

## Backend: Modulos Principais

- `auth`: login, JWT e roles
- `users`: usuarios
- `rooms`: salas e participantes
- `games`: partidas, fases, estado privado, votacao e vitoria
- `players`: jogadores de uma partida
- `words`: palavras e pistas do impostor
- `clues`: dicas por rodada
- `messages`: chat da partida
- `votes`: votos registrados
- `games.gateway`: eventos em tempo real via Socket.IO

## Endpoints e Filtros

As listagens usam paginacao:

```txt
?page=1&limit=10
```

O limite maximo aceito pela API e `50`.

Exemplos:

```txt
/users?email=admin@impostor.local
/rooms?name=suspeitos
/games?room_id=1
/players?game_id=1
/votes?game_id=1&voter_id=2&target_player_id=3
```

## Tempo Real

O backend usa Socket.IO no `GamesGateway`.

Eventos principais:

- `join_room`: conecta o cliente ao canal da sala.
- `game_updated`: envia atualizacoes de partida para os clientes conectados.
- `live_error`: informa falhas de acoes ao vivo.

A pagina Ao Vivo tambem faz refresh periodico para manter jogadores, dicas, mensagens, votos e estado da partida sincronizados.

## Scripts Uteis

Backend:

```bash
cd back
npm run start:dev
npm run build
npm run start:prod
npm test
```

Frontend:

```bash
cd front
npm run dev
npm run build
npm start
npm run lint
```

## Observacoes

- O backend usa `ValidationPipe` com `whitelist` e `forbidNonWhitelisted`, entao DTOs precisam ter decorators do `class-validator`.
- O banco usa snake_case, enquanto o codigo TypeScript usa camelCase com mapeamento via Sequelize.
- Para desenvolvimento local, mantenha backend em `3001` e frontend em `3000`.
- Este projeto foi desenvolvido para fins academicos.
