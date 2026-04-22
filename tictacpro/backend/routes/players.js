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

router.get('/', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM players WHERE games_played > 0 ORDER BY rating DESC LIMIT 200');
    res.json(result.rows.map(formatPlayer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:username', async (req, res) => {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM players WHERE username = ?', args: [req.params.username] });
    if (!result.rows.length) return res.status(404).json({ error: 'Player not found' });
    res.json(formatPlayer(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
