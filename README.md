![alt text](src/common/enums/images/hd-red-among-us-mini-crewmate-baby-sus-sticky-note-hat-png-7339616951222967oki7a2sjw.png)
# 🎮 Impostor Game API

API backend para gerenciamento de partidas do jogo **Impostor Game**, desenvolvida com **NestJS** e **Sequelize**, utilizando **PostgreSQL** como banco de dados.

---

## 🚀 Tecnologias

* Node.js
* NestJS
* Sequelize (ORM)
* PostgreSQL
* Swagger (documentação)
* JWT (autenticação)

---

## 📌 Funcionalidades

* 👤 Gerenciamento de usuários
* 🏠 Criação e gerenciamento de salas
* 🎮 Criação de partidas (games)
* 🧑‍🤝‍🧑 Gerenciamento de jogadores
* 🗳️ Sistema de votação
* 🔍 Filtros e paginação em endpoints
* 🔐 Autenticação com JWT e controle de roles

---

## 📂 Estrutura do Projeto

```
src/
 ├── auth/
 ├── clues/
 ├── words/
 ├── games/
 ├── messages/
 ├── players/
 ├── rooms/
 ├── users/
 ├── votes/
 ├── common/
 │    └── dto/
 │         └── pagination.dto.ts
```

---

## ⚙️ Instalação

```bash
# Clonar o repositório
git clone https://github.com/EnricoCorrea/impostorgame.git

# Entrar no projeto
cd impostorgame

# Instalar dependências
npm install
```

---

## 🔧 Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=senha
DB_NAME=impostorgame

JWT_SECRET=sua_chave_secreta
```

---

## ▶️ Executando o projeto

```bash
npm run start:dev
```

A API estará disponível em:

```
http://localhost:3001
```

---

## 📘 Documentação (Swagger)

Acesse:

```
http://localhost:3001/api
```

---

## 🔐 Autenticação

A API utiliza JWT:

1. Faça login
2. Copie o token
3. Clique em **Authorize** no Swagger
4. Cole o token no formato:

```
Bearer SEU_TOKEN
```

---

## 📄 Paginação

Todos os endpoints de listagem suportam:

```
?page=1&limit=10
```

---

## 🔍 Filtros

Cada entidade possui pelo menos 2 filtros:

### Exemplos:

#### Users

```
/users?email=teste@email.com&role=ADMIN
```

#### Rooms

```
/rooms?name=sala&hostId=1
```

#### Games

```
/games?roomId=1&roundNumber=2
```

#### Players

```
/players?gameId=1&userId=2
```

#### Votes

```
/votes?gameId=1&targetId=3
```

---

## 🎮 Fluxo do Jogo

1. Criar sala
2. Usuários entram na sala
3. Iniciar jogo
4. Jogadores são criados automaticamente
5. Rodadas e votos são executados

---

## 🧪 Testes com Postman

Exemplo de criação de sala:

```json
{
  "name": "Sala Teste",
  "hostId": 1,
  "status": "WAITING",
  "maxUsers": 5
}
```

---

## ⚠️ Padrões do Projeto

* Código usa **camelCase**
* Banco usa **snake_case** (via `field`)
* DTOs alinhados com Models
* Paginação centralizada (`PaginationDto`)
* Filtros específicos por entidade

---

## 📄 Licença

Este projeto é para fins acadêmicos.
