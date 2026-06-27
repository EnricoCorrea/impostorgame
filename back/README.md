# Impostor Game API

Backend de partidas do Impostor Game em NestJS, Sequelize, PostgreSQL e Socket.IO.

## Início rápido com Docker

```bash
docker compose up --build
```

A API ficará em `http://localhost:3001` e o Swagger em `http://localhost:3001/api`. Na primeira criação do volume, o PostgreSQL executa o schema e a seed automaticamente.

Usuários de teste (senha `123456`):

| E-mail | Papel |
|---|---|
| `admin@impostor.local` | ADMIN |
| `ana@impostor.local` | PLAYER |
| `bruno@impostor.local` | PLAYER |

Para recriar o banco e rodar as seeds novamente: `docker compose down -v` e depois `docker compose up --build`.

## Execução local

1. Copie `.env.example` para `.env` e ajuste as credenciais.
2. Crie o banco com `banco_scripts/banco_normalizado.sql`.
3. Execute `banco_scripts/seed.sql`.
4. Rode `npm install` e `npm run start:dev`.

Variáveis obrigatórias: `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`. O SQL do Sequelize usa `logging: console.log`, como solicitado na avaliação.

## Objetos necessários e fluxo para começar uma partida

1. **Usuários:** crie ao menos três em `POST /users` ou use os usuários da seed.
2. **Autenticação:** envie `{ "email", "password" }` para `POST /auth/login` e use o token em `Authorization: Bearer <token>`.
3. **Palavras:** deve existir ao menos uma palavra `{ "word", "impostorClue" }`; a seed já fornece cinco.
4. **Sala:** o anfitrião autenticado envia `{ "name", "maxUsers" }` para `POST /rooms`. `hostId` e `status=WAITING` são definidos pela API, e o anfitrião entra automaticamente.
5. **Participantes:** cada outro usuário autenticado chama `POST /rooms/:id/join`. A sala aceita de 3 a 5 jogadores.
6. **Jogo:** somente o anfitrião chama `POST /games/room/:roomId`. A API sorteia a palavra e cria os jogadores.
7. **Início:** somente o anfitrião chama `POST /games/:id/start`; com menos de três jogadores a API responde `400`, não `500`.
8. **Estado:** cada participante consulta `GET /games/:id/state`. A resposta mostra apenas o próprio papel.
9. **Voto:** na fase `VOTING`, envie `{ "targetId": <id do player> }` para `POST /games/:id/vote`.

Todos os erros HTTP têm o formato `{ statusCode, message, path, timestamp }`. Erros conhecidos do Sequelize (validação, chave única e chave estrangeira) são convertidos em respostas `400` ou `409`.

## WebSocket

Eventos atuais: `join_room`, `start_game`, `vote` e `game_updated`. A sala Socket.IO usa o nome `room-<roomId>`. Para operações que alteram estado, prefira inicialmente os endpoints HTTP autenticados; o cliente pode usar o socket para receber atualizações.

## Qualidade

```bash
npm run build
npm test -- --runInBand
npm run test:e2e
```
