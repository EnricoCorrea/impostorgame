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
  name VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  host_id INT NOT NULL,
  status room_status DEFAULT 'WAITING' NOT NULL,
  max_users INT DEFAULT 3 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  closed_at TIMESTAMP,

  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE room_players (
  room_id INT,
  player_id INT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  PRIMARY KEY (room_id, player_id),

  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  room_id INT NOT NULL,
  winner player_role,
  status game_status DEFAULT 'WAITING' NOT NULL,
  round_number INT DEFAULT 1 NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  finished_at TIMESTAMP,

  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(50) UNIQUE NOT NULL,
  impostor_clue TEXT NOT NULL
);

CREATE TABLE game_words (
  game_id INT PRIMARY KEY,
  word_id INT NOT NULL,

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES words(id)
);

CREATE TABLE players (
  player_id SERIAL PRIMARY KEY,
  game_id INT NOT NULL,
  user_id INT NOT NULL,
  word_id INT NOT NULL,
  role player_role DEFAULT 'INNOCENT' NOT NULL,
  is_alive BOOLEAN DEFAULT TRUE NOT NULL,

  UNIQUE (game_id, user_id),

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES words(id)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  game_id INT NOT NULL,
  player_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE TABLE clues (
  id SERIAL PRIMARY KEY,
  game_id INT NOT NULL,
  player_id INT NOT NULL,
  round_number INT NOT NULL,
  clue TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE TABLE votes (
  round_number INT,
  game_id INT,
  voter_id INT,
  target_player_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  PRIMARY KEY (round_number, game_id, voter_id),

  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (voter_id) REFERENCES players(player_id) ON DELETE CASCADE,
  FOREIGN KEY (target_player_id) REFERENCES players(player_id) ON DELETE SET NULL
);

CREATE INDEX idx_players_game ON players(game_id);
CREATE INDEX idx_votes_game ON votes(game_id);
CREATE INDEX idx_clues_game ON clues(game_id);
CREATE INDEX idx_messages_game ON messages(game_id);