-- ============================================================
-- FICHAS A 100 — Schema PostgreSQL
-- ============================================================

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE game_state AS ENUM (
  'waiting',
  'betting',
  'drawing',
  'rebetting',
  'revealing',
  'finished'
);

CREATE TYPE player_state AS ENUM (
  'waiting',
  'betting',
  'playing',
  'stand',
  'bust',
  'active'
);

CREATE TYPE user_role AS ENUM ('player', 'gestor', 'admin');

CREATE TYPE transaction_type AS ENUM (
  'bet',
  'win',
  'refund',
  'starting_chips',
  'admin_adjustment'
);

-- ============================================================
-- USERS — jugadores, gestores y admins
-- ============================================================

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  role          user_role    NOT NULL DEFAULT 'player',
  password_hash TEXT,                            -- NULL para players (solo necesitan username)
  chips         INTEGER      NOT NULL DEFAULT 1000 CHECK (chips >= 0),
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- ============================================================
-- ROOMS — salas de juego creadas por el gestor/admin
-- ============================================================

CREATE TABLE rooms (
  id             SERIAL PRIMARY KEY,
  room_key       VARCHAR(50)  NOT NULL UNIQUE,   -- ej: 'room-1711234567890'
  name           VARCHAR(100) NOT NULL,
  max_players    SMALLINT     NOT NULL DEFAULT 4
                   CHECK (max_players BETWEEN 2 AND 6),
  min_bet        INTEGER      NOT NULL DEFAULT 10
                   CHECK (min_bet BETWEEN 10 AND 1000),
  starting_chips INTEGER      NOT NULL DEFAULT 1000
                   CHECK (starting_chips BETWEEN 100 AND 10000),
  status         VARCHAR(20)  NOT NULL DEFAULT 'waiting'
                   CHECK (status IN ('waiting', 'playing', 'finished', 'closed')),
  created_by     INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  closed_at      TIMESTAMPTZ
);

-- ============================================================
-- GAMES — rondas dentro de una sala
-- Cada vez que resetGame() se ejecuta, se crea un nuevo registro.
-- ============================================================

CREATE TABLE games (
  id                   SERIAL PRIMARY KEY,
  room_id              INTEGER     NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  round_number         INTEGER     NOT NULL DEFAULT 1,
  game_state           game_state  NOT NULL DEFAULT 'waiting',
  pot                  INTEGER     NOT NULL DEFAULT 0 CHECK (pot >= 0),
  pot_carried_over     BOOLEAN     NOT NULL DEFAULT FALSE, -- TRUE si la ronda anterior todos bustaron
  winner_id            INTEGER     REFERENCES users(id) ON DELETE SET NULL,
  winner_chips_won     INTEGER     CHECK (winner_chips_won > 0),
  available_fichas     SMALLINT[]  NOT NULL DEFAULT '{}', -- fichas 1-99 restantes (barajadas)
  current_player_index SMALLINT    NOT NULL DEFAULT 0,
  started_at           TIMESTAMPTZ,
  finished_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_id, round_number)
);

-- ============================================================
-- GAME_PLAYERS — estado de cada jugador en una ronda concreta
-- ============================================================

CREATE TABLE game_players (
  id           SERIAL      PRIMARY KEY,
  game_id      INTEGER     NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id      INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chips_start  INTEGER     NOT NULL CHECK (chips_start >= 0),
  chips_end    INTEGER     CHECK (chips_end >= 0),   -- NULL mientras la partida está en curso
  current_bet  INTEGER     NOT NULL DEFAULT 0 CHECK (current_bet >= 0),
  score        INTEGER     NOT NULL DEFAULT 0 CHECK (score >= 0),
  fichas       SMALLINT[]  NOT NULL DEFAULT '{}',    -- fichas recibidas esta ronda
  player_state player_state NOT NULL DEFAULT 'waiting',
  seat_order   SMALLINT    NOT NULL,                 -- orden de turno en la mesa (0-based)
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, user_id),
  UNIQUE (game_id, seat_order)
);

-- ============================================================
-- BETS — apuestas individuales (BETTING y REBETTING)
-- ============================================================

CREATE TABLE bets (
  id             SERIAL      PRIMARY KEY,
  game_id        INTEGER     NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  game_player_id INTEGER     NOT NULL REFERENCES game_players(id) ON DELETE CASCADE,
  user_id        INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bet_round      SMALLINT    NOT NULL CHECK (bet_round IN (1, 2)), -- 1 = BETTING / 2 = REBETTING
  amount         INTEGER     NOT NULL CHECK (amount > 0),
  placed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, user_id, bet_round)
);

-- ============================================================
-- FICHAS_DRAWN — historial de cada ficha sacada por turno
-- ============================================================

CREATE TABLE fichas_drawn (
  id             SERIAL      PRIMARY KEY,
  game_id        INTEGER     NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  game_player_id INTEGER     NOT NULL REFERENCES game_players(id) ON DELETE CASCADE,
  user_id        INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ficha_value    SMALLINT    NOT NULL CHECK (ficha_value BETWEEN 1 AND 99),
  score_after    INTEGER     NOT NULL CHECK (score_after >= 0),
  busted         BOOLEAN     NOT NULL DEFAULT FALSE,
  draw_order     SMALLINT    NOT NULL, -- orden global de fichas sacadas en la ronda
  drawn_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHIP_TRANSACTIONS — historial de movimientos de saldo
-- ============================================================

CREATE TABLE chip_transactions (
  id               SERIAL           PRIMARY KEY,
  user_id          INTEGER          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id          INTEGER          REFERENCES games(id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  amount           INTEGER          NOT NULL,   -- positivo = ingreso, negativo = gasto
  chips_before     INTEGER          NOT NULL CHECK (chips_before >= 0),
  chips_after      INTEGER          NOT NULL CHECK (chips_after >= 0),
  description      TEXT,
  created_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_rooms_status          ON rooms(status);
CREATE INDEX idx_rooms_created_by      ON rooms(created_by);

CREATE INDEX idx_games_room_id         ON games(room_id);
CREATE INDEX idx_games_state           ON games(game_state);
CREATE INDEX idx_games_winner          ON games(winner_id);

CREATE INDEX idx_game_players_game     ON game_players(game_id);
CREATE INDEX idx_game_players_user     ON game_players(user_id);

CREATE INDEX idx_bets_game             ON bets(game_id);
CREATE INDEX idx_bets_user             ON bets(user_id);

CREATE INDEX idx_fichas_drawn_game     ON fichas_drawn(game_id);
CREATE INDEX idx_fichas_drawn_user     ON fichas_drawn(user_id);

CREATE INDEX idx_chip_tx_user          ON chip_transactions(user_id);
CREATE INDEX idx_chip_tx_game          ON chip_transactions(game_id);
CREATE INDEX idx_chip_tx_created       ON chip_transactions(created_at DESC);

-- ============================================================
-- SEED DATA — usuarios base del sistema
-- Las contraseñas deben sustituirse por hashes bcrypt reales antes de producción.
--   gestor:  'gestor123'   → reemplazar con bcrypt hash
--   admin:   'admin123'    → reemplazar con bcrypt hash
-- ============================================================

INSERT INTO users (username, role, password_hash, chips) VALUES
  ('gestor', 'gestor', '$2b$10$cnxQiJqrDGzz/sWEDrF0ru.KYSzkRjhs4hfATa1Q0QFOHWK.fgMue', 0),
  ('admin',  'admin',  '$2b$10$3d4XUNLGaGzX3jjg8r.zDu818TniIGQoJLgMAqtIYD2.h1XxMSbAC',  0);
