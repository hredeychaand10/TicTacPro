const router = require('express').Router();
const db = require('../db');

const STARTING_RATING = 1200;

const expectedScore = (rA, rB) => 1 / (1 + Math.pow(10, (rB - rA) / 400));
const kFactor = (games) => (games < 30 ? 32 : 16);

const calcElo = (rA, rB, scoreA, gA, gB) => {
  const exp = expectedScore(rA, rB);
  const dA = Math.round(kFactor(gA) * (scoreA - exp));
  const dB = Math.round(kFactor(gB) * ((1 - scoreA) - (1 - exp)));
  return { newA: Math.max(100, rA + dA), dA, newB: Math.max(100, rB + dB), dB };
};

const ACHIEVEMENT_CHECKS = [
  ['first_win',    p => p.wins >= 1],
  ['hat_trick',    p => p.current_streak >= 3],
  ['win_streak_5', p => p.current_streak >= 5],
  ['win_streak_10',p => p.current_streak >= 10],
  ['veteran',      p => p.games_played >= 100],
  ['draw_master',  p => p.draw_count >= 10],
  ['rating_1300',  p => p.rating >= 1300],
  ['rating_1500',  p => p.rating >= 1500],
  ['rating_1800',  p => p.rating >= 1800],
  ['ai_slayer',    p => p.ai_hard_wins >= 1],
  ['ai_streak',    p => p.ai_hard_streak >= 5],
  ['corner_master',p => p.corner_wins >= 5],
  ['speed_demon',  p => p._wonIn5 === true],
];

const processAchievements = (player) => {
  const current = Array.isArray(player.achievements) ? [...player.achievements] : JSON.parse(player.achievements || '[]');
  const unlocked = [];
  ACHIEVEMENT_CHECKS.forEach(([id, check]) => {
    if (!current.includes(id) && check(player)) {
      current.push(id);
      unlocked.push(id);
    }
  });
  return { achievements: current, unlocked };
};

const parsePlayer = (r) => ({
  ...r,
  achievements:   JSON.parse(r.achievements   || '[]'),
  rating_history: JSON.parse(r.rating_history || '[]'),
  opponents:      JSON.parse(r.opponents       || '[]'),
});

const getOrCreate = (name) => {
  const row = db.prepare('SELECT * FROM players WHERE username = ?').get(name);
  if (row) return parsePlayer(row);

  const history = JSON.stringify([{ rating: STARTING_RATING, date: Date.now() }]);
  db.prepare('INSERT INTO players (username, rating_history) VALUES (?, ?)').run(name, history);
  const newRow = db.prepare('SELECT * FROM players WHERE username = ?').get(name);
  return { ...newRow, achievements: [], rating_history: JSON.parse(history), opponents: [] };
};

const savePlayerAfterGame = (player, won, drew, isAI, aiDiff, newRating, opponent, context) => {
  const updated = {
    ...player,
    rating:          newRating,
    wins:            player.wins         + (won  ? 1 : 0),
    losses:          player.losses       + (!won && !drew ? 1 : 0),
    draws:           player.draws        + (drew ? 1 : 0),
    games_played:    player.games_played + 1,
    current_streak:  won ? player.current_streak + 1 : 0,
    max_streak:      won ? Math.max(player.max_streak, player.current_streak + 1) : player.max_streak,
    draw_count:      player.draw_count   + (drew ? 1 : 0),
    ai_wins:         player.ai_wins      + (isAI && won ? 1 : 0),
    ai_hard_wins:    player.ai_hard_wins + (isAI && aiDiff === 'hard' && won ? 1 : 0),
    ai_hard_streak:  isAI && aiDiff === 'hard' ? (won ? player.ai_hard_streak + 1 : 0) : player.ai_hard_streak,
    corner_wins:     player.corner_wins  + (won && context?.firstMoveCorner ? 1 : 0),
    _wonIn5:         won && context?.wonIn5,
  };

  updated.rating_history = [...(player.rating_history || []), { rating: newRating, date: Date.now() }].slice(-100);

  if (opponent && !updated.opponents.includes(opponent)) {
    updated.opponents = [...(updated.opponents || []), opponent];
  }

  const { achievements, unlocked } = processAchievements(updated);
  updated.achievements = achievements;

  db.prepare(`
    UPDATE players SET
      rating=?, wins=?, losses=?, draws=?, games_played=?,
      current_streak=?, max_streak=?, draw_count=?,
      ai_wins=?, ai_hard_wins=?, ai_hard_streak=?, corner_wins=?,
      opponents=?, achievements=?, rating_history=?,
      updated_at=?
    WHERE username=?
  `).run(
    updated.rating, updated.wins, updated.losses, updated.draws, updated.games_played,
    updated.current_streak, updated.max_streak, updated.draw_count,
    updated.ai_wins, updated.ai_hard_wins, updated.ai_hard_streak, updated.corner_wins,
    JSON.stringify(updated.opponents),
    JSON.stringify(achievements),
    JSON.stringify(updated.rating_history),
    Date.now(),
    player.username
  );

  return { player: updated, unlocked };
};

router.get('/stats', (req, res) => {
  try {
    const totalPlayers = db.prepare('SELECT COUNT(*) AS v FROM players').get().v;
    const totalGames   = db.prepare('SELECT COUNT(*) AS v FROM games').get().v;
    const xWins        = db.prepare("SELECT COUNT(*) AS v FROM games WHERE result='X'").get().v;
    const oWins        = db.prepare("SELECT COUNT(*) AS v FROM games WHERE result='O'").get().v;
    const draws        = db.prepare("SELECT COUNT(*) AS v FROM games WHERE result='draw'").get().v;
    const topRating    = db.prepare('SELECT COALESCE(MAX(rating), 1200) AS v FROM players').get().v;
    res.json({ totalPlayers, totalGames, xWins, oWins, draws, topRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', (req, res) => {
  const { username, limit = 200 } = req.query;
  try {
    const cap = Math.min(parseInt(limit) || 200, 1000);
    let rows;
    if (username) {
      rows = db.prepare('SELECT * FROM games WHERE player_x = ? OR player_o = ? ORDER BY played_at DESC LIMIT ?').all(username, username, cap);
    } else {
      rows = db.prepare('SELECT * FROM games ORDER BY played_at DESC LIMIT ?').all(cap);
    }
    res.json(rows.map(g => ({
      id:           g.id,
      playerX:      g.player_x,
      playerO:      g.player_o,
      result:       g.result,
      mode:         g.mode,
      aiDifficulty: g.ai_difficulty,
      moves:        JSON.parse(g.moves || '[]'),
      duration:     g.duration,
      playedAt:     g.played_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', (req, res) => {
  const { playerX, playerO, result, mode, aiDifficulty, moves, duration, playedAt, context } = req.body;
  if (!playerX || !playerO || !result || !mode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    db.prepare(
      'INSERT INTO games (player_x, player_o, result, mode, ai_difficulty, moves, duration, played_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(playerX, playerO, result, mode, aiDifficulty || null, JSON.stringify(moves || []), duration || 0, playedAt || Date.now());

    const isAI    = mode === 'ai';
    const scoreX  = result === 'X' ? 1 : result === 'O' ? 0 : 0.5;
    const aiRating = aiDifficulty === 'hard' ? 1600 : aiDifficulty === 'medium' ? 1350 : 1100;

    const pX = getOrCreate(playerX);
    const pO = isAI ? null : getOrCreate(playerO);

    const rO   = isAI ? aiRating : pO.rating;
    const gO   = isAI ? 999 : pO.games_played;
    const eloR = calcElo(pX.rating, rO, scoreX, pX.games_played, gO);

    const { unlocked: unlockedX } = savePlayerAfterGame(
      pX, result === 'X', result === 'draw', isAI, aiDifficulty, eloR.newA,
      isAI ? null : playerO, context
    );

    let unlockedO = [];
    if (!isAI && pO) {
      const eloO = calcElo(pO.rating, pX.rating, 1 - scoreX, pO.games_played, pX.games_played);
      const { unlocked } = savePlayerAfterGame(
        pO, result === 'O', result === 'draw', false, null, eloO.newA,
        playerX, context
      );
      unlockedO = unlocked;
      eloR.newB = eloO.newA;
      eloR.dB   = eloO.dA;
    }

    res.json({
      success: true,
      ratingChange: {
        deltaX: eloR.dA, newX: eloR.newA,
        ...(pO ? { deltaO: eloR.dB, newO: eloR.newB } : {}),
      },
      unlockedX,
      unlockedO,
    });
  } catch (err) {
    console.error('Save game error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
