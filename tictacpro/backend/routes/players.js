const router = require('express').Router();
const db = require('../db');

const formatPlayer = (r) => ({
  username:      r.username,
  avatar:        r.avatar,
  rating:        r.rating,
  wins:          r.wins,
  losses:        r.losses,
  draws:         r.draws,
  gamesPlayed:   r.games_played,
  currentStreak: r.current_streak,
  maxStreak:     r.max_streak,
  drawCount:     r.draw_count,
  aiWins:        r.ai_wins,
  aiHardWins:    r.ai_hard_wins,
  achievements:  JSON.parse(r.achievements   || '[]'),
  ratingHistory: JSON.parse(r.rating_history || '[]'),
  joinedAt:      r.joined_at  || Date.now(),
  updatedAt:     r.updated_at || Date.now(),
});

router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM players WHERE games_played > 0 ORDER BY rating DESC LIMIT 200').all();
    res.json(rows.map(formatPlayer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:username', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM players WHERE username = ?').get(req.params.username);
    if (!row) return res.status(404).json({ error: 'Player not found' });
    res.json(formatPlayer(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
