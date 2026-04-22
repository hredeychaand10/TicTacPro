const CONFIG = {
  STARTING_RATING:  1200,
  K_FACTOR_NEW:     32,
  K_FACTOR_EST:     16,
  ESTABLISHED_GAMES:30,
  AI_THINK_MS:      { easy: 350, medium: 650, hard: 950 },
  TIMER_SECONDS:    { none: null, '1min': 60, '3min': 180, '5min': 300 },

  WIN_COMBOS: [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ],

  ACHIEVEMENTS: [
    { id: 'first_win',    name: 'First Blood',      icon: '⚔️',  desc: 'Win your first game' },
    { id: 'hat_trick',    name: 'Hat Trick',         icon: '🎩',  desc: 'Win 3 games in a row' },
    { id: 'speed_demon',  name: 'Speed Demon',       icon: '⚡',  desc: 'Win in 5 moves' },
    { id: 'win_streak_5', name: 'On Fire',           icon: '🔥',  desc: 'Win 5 games in a row' },
    { id: 'win_streak_10',name: 'Unbeatable',        icon: '🛡️',  desc: 'Win 10 games in a row' },
    { id: 'veteran',      name: 'Veteran',           icon: '🎖️',  desc: 'Play 100 games' },
    { id: 'draw_master',  name: 'Draw Artist',       icon: '🤝',  desc: 'Draw 10 games' },
    { id: 'rating_1300',  name: 'Rising Star',       icon: '⭐',  desc: 'Reach 1300 rating' },
    { id: 'rating_1500',  name: 'Champion',          icon: '🏆',  desc: 'Reach 1500 rating' },
    { id: 'rating_1800',  name: 'Grandmaster',       icon: '👑',  desc: 'Reach 1800 rating' },
    { id: 'ai_slayer',    name: 'AI Slayer',         icon: '🤖',  desc: 'Beat the Hard AI' },
    { id: 'ai_streak',    name: 'Machine Breaker',   icon: '⚙️',  desc: 'Beat Hard AI 5 times in a row' },
    { id: 'corner_master',name: 'Corner Master',     icon: '🎯',  desc: 'Win from corner opening 5 times' },
  ],
};
