const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const STARTING_RATING = 1200;

const formatPlayer = (row) => ({
  username: row.username,
  avatar: row.avatar,
  rating: row.rating,
  wins: row.wins,
  losses: row.losses,
  draws: row.draws,
  gamesPlayed: row.games_played,
  currentStreak: row.current_streak,
  maxStreak: row.max_streak,
  drawCount: row.draw_count,
  aiWins: row.ai_wins,
  aiHardWins: row.ai_hard_wins,
  aiHardStreak: row.ai_hard_streak,
  cornerWins: row.corner_wins,
  opponents: typeof row.opponents === 'string' ? JSON.parse(row.opponents) : (row.opponents || []),
  achievements: typeof row.achievements === 'string' ? JSON.parse(row.achievements) : (row.achievements || []),
  ratingHistory: typeof row.rating_history === 'string' ? JSON.parse(row.rating_history) : (row.rating_history || []),
  joinedAt: row.joined_at ? new Date(row.joined_at).getTime() : Date.now(),
  updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
});

router.post('/register', async (req, res) => {
  const { username, password, avatar } = req.body;

  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return res.status(400).json({ error: 'Invalid username format' });
  if (password.length < 4) return res.status(400).json({ error: 'Password too short' });

  try {
    const [existing] = await db.query('SELECT id FROM players WHERE username = ?', [username]);
    if (existing.length) return res.status(409).json({ error: 'Username taken' });

    const hashed = await bcrypt.hash(password, 10);
    const ratingHistory = JSON.stringify([{ rating: STARTING_RATING, date: Date.now() }]);

    await db.query(
      'INSERT INTO players (username, password, avatar, rating_history) VALUES (?, ?, ?, ?)',
      [username, hashed, avatar || '🦊', ratingHistory]
    );

    const [rows] = await db.query('SELECT * FROM players WHERE username = ?', [username]);
    const player = formatPlayer(rows[0]);
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ token, player });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const [rows] = await db.query('SELECT * FROM players WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const player = formatPlayer(rows[0]);
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, player });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
module.exports.formatPlayer = formatPlayer;
