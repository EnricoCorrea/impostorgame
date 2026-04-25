CREATE TYPE game_status AS ENUM (
  'WAITING',
  'CLUE',
  'DISCUSSING',
  'VOTING'
);

CREATE TYPE room_status AS ENUM (
  'WAITING',
  'PLAYING',
  'CLOSED'
);

CREATE TYPE player_role AS ENUM (
  'IMPOSTOR',
  'INNOCENT'
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  host_id INT,
  status room_status,
  max_users INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,

  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE room_players (
  room_id INT,
  player_id INT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (room_id, player_id),

  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  room_id INT,
  winner player_role,
  status game_status,
  round_number INT,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,

  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,

  CHECK (
    finished_at IS NULL OR finished_at >= started_at
  )
);

CREATE TABLE words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(50),
  impostor_clue TEXT
);

CREATE TABLE game_words (
  game_id INT PRIMARY KEY,
  game_word_id INT,

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (game_word_id) REFERENCES words(id)
);

CREATE TABLE players (
  player_id SERIAL PRIMARY KEY,
  game_id INT,
  user_id INT,
  word_id INT,
  role player_role,
  is_alive BOOLEAN DEFAULT TRUE,

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES words(id)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  game_id INT,
  player_id INT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE TABLE clues (
  id SERIAL PRIMARY KEY,
  game_id INT,
  player_id INT,
  round_number INT,
  clue TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE TABLE votes (
  round_number INT,
  game_id INT,
  voter_id INT,
  target_player_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (round_number, game_id, voter_id),

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (voter_id) REFERENCES players(player_id) ON DELETE CASCADE,
  FOREIGN KEY (target_player_id) REFERENCES players(player_id) ON DELETE SET NULL
);

CREATE INDEX idx_players_game ON players(game_id);
CREATE INDEX idx_votes_game ON votes(game_id);
CREATE INDEX idx_clues_game ON clues(game_id);
CREATE INDEX idx_messages_game ON messages(game_id);