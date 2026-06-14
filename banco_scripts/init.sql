CREATE TYPE game_status AS ENUM ('WAITING', 'CLUE', 'DISCUSSING', 'VOTING');
CREATE TYPE room_status AS ENUM ('WAITING', 'PLAYING', 'CLOSED');
CREATE TYPE player_role AS ENUM ('IMPOSTOR', 'INNOCENT');

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(50) DEFAULT 'PLAYER' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  host_id    INT REFERENCES users(id) ON DELETE SET NULL,
  status     room_status DEFAULT 'WAITING' NOT NULL,
  max_users  INT DEFAULT 5 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  closed_at  TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_users (
  id      SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  UNIQUE (user_id, room_id)
);

CREATE TABLE IF NOT EXISTS words (
  id            SERIAL PRIMARY KEY,
  word          VARCHAR(50) UNIQUE NOT NULL,
  impostor_clue TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS games (
  id           SERIAL PRIMARY KEY,
  room_id      INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  winner       player_role,
  status       game_status DEFAULT 'WAITING' NOT NULL,
  round_number INT DEFAULT 1 NOT NULL,
  started_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  finished_at  TIMESTAMP
);

INSERT INTO words (word, impostor_clue) VALUES
  ('Praia',    'Areia'),
  ('Futebol',  'Bola'),
  ('Pizza',    'Queijo'),
  ('Cinema',   'Pipoca'),
  ('Aviao',    'Asa'),
  ('Hospital', 'Medico'),
  ('Escola',   'Caderno'),
  ('Floresta', 'Arvore'),
  ('Nave',     'Espaco'),
  ('Banco',    'Dinheiro');

CREATE TABLE IF NOT EXISTS game_words (
  id      SERIAL PRIMARY KEY,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  word_id INT NOT NULL REFERENCES words(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS players (
  id       SERIAL PRIMARY KEY,
  game_id  INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id  INT REFERENCES words(id),
  role     player_role DEFAULT 'INNOCENT',
  is_alive BOOLEAN DEFAULT TRUE NOT NULL,
  UNIQUE (game_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  game_id    INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id  INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS clues (
  id           SERIAL PRIMARY KEY,
  game_id      INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id    INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  round_number INT,
  clue         TEXT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS votes (
  id               SERIAL PRIMARY KEY,
  game_id          INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  voter_id         INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  target_player_id INT REFERENCES players(id) ON DELETE SET NULL,
  round_number     INT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
