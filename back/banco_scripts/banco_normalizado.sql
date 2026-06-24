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


CREATE TABLE public.clues (
	id serial4 NOT NULL,
	game_id int4 NOT NULL,
	player_id int4 NOT NULL,
	round_number int4 NOT NULL,
	clue text NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT clues_pkey PRIMARY KEY (id),
	CONSTRAINT clues_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE,
	CONSTRAINT clues_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE
);
CREATE INDEX idx_clues_game ON public.clues USING btree (game_id);


CREATE TABLE public.game_words (
	game_id int4 NOT NULL,
	word_id int4 NOT NULL,
	CONSTRAINT game_words_pkey PRIMARY KEY (game_id),
	CONSTRAINT game_words_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE,
	CONSTRAINT game_words_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(id)
);


CREATE TABLE public.games (
	id serial4 NOT NULL,
	room_id int4 NOT NULL,
	winner public."player_role" NULL,
	status public."game_status" DEFAULT 'WAITING'::game_status NOT NULL,
	round_number int4 DEFAULT 1 NOT NULL,
	started_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	finished_at timestamp NULL,
	CONSTRAINT games_pkey PRIMARY KEY (id),
	CONSTRAINT games_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE
);



CREATE TABLE public.messages (
	id serial4 NOT NULL,
	game_id int4 NOT NULL,
	player_id int4 NOT NULL,
	"content" text NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT messages_pkey PRIMARY KEY (id),
	CONSTRAINT messages_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE,
	CONSTRAINT messages_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE
);
CREATE INDEX idx_messages_game ON public.messages USING btree (game_id);


CREATE TABLE public.players (
	id int4 DEFAULT nextval('players_player_id_seq'::regclass) NOT NULL,
	game_id int4 NOT NULL,
	user_id int4 NOT NULL,
	word_id int4 NOT NULL,
	"role" public."player_role" DEFAULT 'INNOCENT'::player_role NOT NULL,
	is_alive bool DEFAULT true NOT NULL,
	CONSTRAINT players_game_id_user_id_key UNIQUE (game_id, user_id),
	CONSTRAINT players_pkey PRIMARY KEY (id),
	CONSTRAINT players_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE,
	CONSTRAINT players_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
	CONSTRAINT players_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(id)
);
CREATE INDEX idx_players_game ON public.players USING btree (game_id);


CREATE TABLE public.room_users (
	room_id int4 NOT NULL,
	user_id int4 NOT NULL,
	joined_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT room_players_pkey PRIMARY KEY (room_id, user_id),
	CONSTRAINT fk_room_users FOREIGN KEY (user_id) REFERENCES public.users(id),
	CONSTRAINT room_players_player_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
	CONSTRAINT room_players_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE
);


CREATE TABLE public.rooms (
	id serial4 NOT NULL,
	"name" varchar(100) NOT NULL,
	host_id int4 NOT NULL,
	status public."room_status" DEFAULT 'WAITING'::room_status NOT NULL,
	max_users int4 DEFAULT 3 NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	closed_at timestamp NULL,
	CONSTRAINT rooms_pkey PRIMARY KEY (id),
	CONSTRAINT rooms_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE
);


CREATE TABLE public.users (
	id serial4 NOT NULL,
	"name" varchar(100) NOT NULL,
	email varchar(150) NOT NULL,
	"password" varchar(255) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"role" varchar(20) DEFAULT 'PLAYER'::character varying NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_name_key UNIQUE (name),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);


CREATE TABLE public.votes (
	round_number int4 NOT NULL,
	game_id int4 NOT NULL,
	voter_id int4 NOT NULL,
	target_player_id int4 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT votes_pkey PRIMARY KEY (round_number, game_id, voter_id),
	CONSTRAINT votes_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE,
	CONSTRAINT votes_target_player_id_fkey FOREIGN KEY (target_player_id) REFERENCES public.players(id) ON DELETE SET NULL,
	CONSTRAINT votes_voter_id_fkey FOREIGN KEY (voter_id) REFERENCES public.players(id) ON DELETE CASCADE
);
CREATE INDEX idx_votes_game ON public.votes USING btree (game_id);

CREATE TABLE public.words (
	id serial4 NOT NULL,
	word varchar(50) NOT NULL,
	impostor_clue text NOT NULL,
	CONSTRAINT unique_word UNIQUE (word),
	CONSTRAINT words_pkey PRIMARY KEY (id),
	CONSTRAINT words_word_key UNIQUE (word)
);