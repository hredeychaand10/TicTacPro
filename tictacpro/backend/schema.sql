CREATE DATABASE IF NOT EXISTS tictacpro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tictacpro;

CREATE TABLE IF NOT EXISTS players (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL DEFAULT '',
  avatar        VARCHAR(10) NOT NULL DEFAULT '🎮',
  rating        INT NOT NULL DEFAULT 1200,
  wins          INT NOT NULL DEFAULT 0,
  losses        INT NOT NULL DEFAULT 0,
  draws         INT NOT NULL DEFAULT 0,
  games_played  INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  max_streak    INT NOT NULL DEFAULT 0,
  draw_count    INT NOT NULL DEFAULT 0,
  ai_wins       INT NOT NULL DEFAULT 0,
  ai_hard_wins  INT NOT NULL DEFAULT 0,
  ai_hard_streak INT NOT NULL DEFAULT 0,
  corner_wins   INT NOT NULL DEFAULT 0,
  opponents     JSON NOT NULL DEFAULT (JSON_ARRAY()),
  achievements  JSON NOT NULL DEFAULT (JSON_ARRAY()),
  rating_history JSON NOT NULL DEFAULT (JSON_ARRAY()),
  joined_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  player_x      VARCHAR(50) NOT NULL,
  player_o      VARCHAR(50) NOT NULL,
  result        ENUM('X','O','draw') NOT NULL,
  mode          ENUM('1v1','ai') NOT NULL,
  ai_difficulty VARCHAR(10) NULL,
  moves         JSON NOT NULL DEFAULT (JSON_ARRAY()),
  duration      INT NOT NULL DEFAULT 0,
  played_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_player_x  (player_x),
  INDEX idx_player_o  (player_o),
  INDEX idx_played_at (played_at DESC)
);
