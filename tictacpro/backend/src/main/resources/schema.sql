CREATE TABLE IF NOT EXISTS players (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  username       TEXT UNIQUE NOT NULL,
  password       TEXT NOT NULL DEFAULT '',
  avatar         TEXT NOT NULL DEFAULT '🎮',
  rating         INTEGER NOT NULL DEFAULT 1200,
  wins           INTEGER NOT NULL DEFAULT 0,
  losses         INTEGER NOT NULL DEFAULT 0,
  draws          INTEGER NOT NULL DEFAULT 0,
  games_played   INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  max_streak     INTEGER NOT NULL DEFAULT 0,
  draw_count     INTEGER NOT NULL DEFAULT 0,
  ai_wins        INTEGER NOT NULL DEFAULT 0,
  ai_hard_wins   INTEGER NOT NULL DEFAULT 0,
  ai_hard_streak INTEGER NOT NULL DEFAULT 0,
  corner_wins    INTEGER NOT NULL DEFAULT 0,
  opponents      TEXT NOT NULL DEFAULT '[]',
  achievements   TEXT NOT NULL DEFAULT '[]',
  rating_history TEXT NOT NULL DEFAULT '[]',
  joined_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS games (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  player_x      TEXT NOT NULL,
  player_o      TEXT NOT NULL,
  result        TEXT NOT NULL,
  mode          TEXT NOT NULL,
  ai_difficulty TEXT,
  moves         TEXT NOT NULL DEFAULT '[]',
  duration      INTEGER NOT NULL DEFAULT 0,
  played_at     INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX IF NOT EXISTS idx_player_x  ON games(player_x);
CREATE INDEX IF NOT EXISTS idx_player_o  ON games(player_o);
CREATE INDEX IF NOT EXISTS idx_played_at ON games(played_at DESC);
