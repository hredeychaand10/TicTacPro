const App = (() => {
  let state = {
    view: 'home',
    lobby: { mode: '1v1', difficulty: 'medium', timeControl: 'none', p1: '', p2: '' },
    data:  {},
    dashSearch: '',
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const navigate = async (view, opts = {}) => {
    state.view = view;
    Object.assign(state, opts);
    showLoading();
    await loadData(view);
    render();
    window.scrollTo(0, 0);
  };

  const showLoading = () => {
    const m = $('#main');
    if (m) m.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;color:var(--text-3);gap:10px;font-size:.9rem">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
      Loading…
    </div>`;
  };

  const loadData = async (view) => {
    try {
      if (view === 'home') {
        state.data.stats = await Storage.getGlobalStats();
      } else if (view === 'dashboard') {
        const [players, games, stats] = await Promise.all([
          Storage.getAllPlayers(),
          Storage.getAllGames(null, 500),
          Storage.getGlobalStats(),
        ]);
        state.data.players = players;
        state.data.games   = games;
        state.data.stats   = stats;
      }
    } catch (e) { console.error('loadData:', e); }
  };

  const render = () => {
    const main = $('#main');
    if (!main) return;
    updateNav();
    const views = { home: renderHome, lobby: renderLobby, game: renderGame, dashboard: renderDashboard };
    main.innerHTML = (views[state.view] || renderHome)();
    bindView();
  };

  const updateNav = () => {
    $$('.nav-link, .mobile-link').forEach(el => {
      el.classList.toggle('active', el.dataset.link === state.view);
    });
  };

  const toast = (msg, type = 'info', dur = 3500) => {
    const c = $('#toast-container');
    if (!c) return;
    const icons = { success: '✓', error: '✗', info: 'ℹ', warning: '⚠', achievement: '🏆' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(() => { el.style.animation = 'fadeOut 0.3s ease forwards'; setTimeout(() => el.remove(), 300); }, dur);
  };

  const renderHome = () => {
    const s = state.data.stats || { totalGames: 0, totalPlayers: 0 };
    return `
    <div class="home-hero">
      <div class="hero-main">
        <h1 class="hero-title">Play.<br><span class="hero-title-accent">Compete.</span><br>Dominate.</h1>
        <p class="hero-subtitle">The ultimate competitive Tic Tac Toe platform. Earn ratings, climb the ranks, and prove your supremacy.</p>
        <div class="hero-cta">
          <button class="btn btn-primary btn-xl" data-link="lobby">Play Now</button>
        </div>
      </div>
      <div class="hero-stats">
        <div class="hero-stats-inner" style="grid-template-columns:repeat(2,1fr)">
          <div><div class="hero-stat-num">${s.totalGames.toLocaleString()}</div><div class="hero-stat-label">Games Played</div></div>
          <div><div class="hero-stat-num">${s.totalPlayers.toLocaleString()}</div><div class="hero-stat-label">Players</div></div>
        </div>
      </div>
    </div>

    <div class="home-features">
      <div class="container">
        <div class="section-header">
          <div class="section-label">Platform Features</div>
          <h2 class="section-title">More than just Tic Tac Toe</h2>
          <p class="section-sub">A full competitive platform with real stats, ratings, and history</p>
        </div>
        <div class="features-grid">
          <div class="feature-card"><div class="feature-icon feature-icon-blue">🤖</div><div class="feature-title">AI Opponent</div><div class="feature-desc">Easy, Medium, and a perfect Hard mode using minimax with alpha-beta pruning.</div></div>
          <div class="feature-card"><div class="feature-icon feature-icon-gold">📈</div><div class="feature-title">ELO Ratings</div><div class="feature-desc">Chess-style ELO system backed by MySQL. Your rating persists by name — no account needed.</div></div>
          <div class="feature-card"><div class="feature-icon feature-icon-green">🗄️</div><div class="feature-title">Game Database</div><div class="feature-desc">Every game is stored in MySQL. Browse the full history, filter by player, and view live stats.</div></div>
          <div class="feature-card"><div class="feature-icon feature-icon-purple">🎖️</div><div class="feature-title">Achievements</div><div class="feature-desc">13 achievements to unlock — from your first win to beating the Hard AI in a row.</div></div>
          <div class="feature-card"><div class="feature-icon feature-icon-red">⏱️</div><div class="feature-title">Time Controls</div><div class="feature-desc">Play with no clock or choose 1, 3, or 5 minute time controls for pressure.</div></div>
          <div class="feature-card"><div class="feature-icon feature-icon-cyan">📊</div><div class="feature-title">Live Dashboard</div><div class="feature-desc">See every game ever played, all player stats, win rates and rating history live.</div></div>
        </div>
      </div>
    </div>`;
  };

  const renderLobby = () => {
    const { mode, difficulty, timeControl, p1, p2 } = state.lobby;
    return `
    <div class="lobby-view">
      <h1 class="lobby-title">New Game</h1>
      <p class="lobby-sub">Enter player names and configure your match</p>

      <div class="lobby-name-row">
        <div class="form-group" style="flex:1">
          <label class="label">Player 1 (X)</label>
          <input class="input input-lg" id="p1-input" type="text" placeholder="Enter name…" value="${p1}" maxlength="30" autocomplete="off">
        </div>
        <div class="vs-badge">VS</div>
        <div class="form-group" style="flex:1">
          <label class="label">${mode === 'ai' ? 'Opponent' : 'Player 2 (O)'}</label>
          ${mode === 'ai'
            ? `<input class="input input-lg" value="Computer 🤖" disabled style="opacity:.6">`
            : `<input class="input input-lg" id="p2-input" type="text" placeholder="Enter name…" value="${p2}" maxlength="30" autocomplete="off">`}
        </div>
      </div>

      <div class="mode-cards">
        <div class="mode-card ${mode === '1v1' ? 'selected' : ''}" data-mode="1v1">
          <div class="mode-icon">👥</div>
          <div class="mode-name">Local 1v1</div>
          <div class="mode-desc">Two players on the same device taking turns.</div>
        </div>
        <div class="mode-card ${mode === 'ai' ? 'selected' : ''}" data-mode="ai">
          <div class="mode-icon">🤖</div>
          <div class="mode-name">vs Computer</div>
          <div class="mode-desc">Challenge the AI — Easy, Medium, or unbeatable Hard.</div>
        </div>
      </div>

      <div class="lobby-settings">
        <div class="lobby-settings-title">⚙️ Match Settings</div>
        ${mode === 'ai' ? `
        <div class="form-group">
          <label class="label">AI Difficulty</label>
          <div class="difficulty-btns">
            <button class="diff-btn easy   ${difficulty === 'easy'   ? 'active' : ''}" data-diff="easy">Easy</button>
            <button class="diff-btn medium ${difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
            <button class="diff-btn hard   ${difficulty === 'hard'   ? 'active' : ''}" data-diff="hard">Hard</button>
          </div>
        </div>` : ''}
        <div class="form-group">
          <label class="label">Time Control</label>
          <select class="input" id="time-select">
            <option value="none"  ${timeControl === 'none'  ? 'selected' : ''}>No Timer</option>
            <option value="1min"  ${timeControl === '1min'  ? 'selected' : ''}>1 Minute</option>
            <option value="3min"  ${timeControl === '3min'  ? 'selected' : ''}>3 Minutes</option>
            <option value="5min"  ${timeControl === '5min'  ? 'selected' : ''}>5 Minutes</option>
          </select>
        </div>
      </div>

      <div id="lobby-error" class="form-error hidden"></div>
      <button class="btn btn-primary btn-lg" id="start-btn">Start Game</button>
    </div>`;
  };

  const renderGame = () => {
    const gs = Game.getState();
    if (!gs) return `<div class="container" style="padding:80px 0;text-align:center"><p>No active game. <span data-link="lobby" style="color:var(--accent);cursor:pointer">Go to lobby →</span></p></div>`;

    const oName   = gs.playerO;
    const oRating = gs.isAI ? (gs.aiDifficulty === 'hard' ? 1600 : gs.aiDifficulty === 'medium' ? 1350 : 1100) : (gs.ratingO || '—');
    const xRating = gs.ratingX || '—';

    const timerX = gs.timeControl && gs.timeControl !== 'none' ? `<div class="player-timer" id="timer-x">${fmtTime(gs.timerX)}</div>` : '';
    const timerO = gs.timeControl && gs.timeControl !== 'none' ? `<div class="player-timer" id="timer-o">${fmtTime(gs.timerO)}</div>` : '';

    return `
    <div class="game-view">
      <div id="game-status" class="game-status-bar x-turn">${gs.playerX}'s turn</div>
      <div class="game-layout">
        <div class="game-player-panel">
          <div class="player-card-game" id="card-x">
            <div class="player-card-top">
              <div class="player-symbol symbol-x">X</div>
              <div><div class="player-name-game">${gs.playerX}</div><div class="player-rating-game">Rating: ${xRating}</div></div>
            </div>
            ${timerX}
          </div>
          <div class="move-history-panel">
            <div class="move-history-title">Move History</div>
            <div class="move-list" id="move-list"></div>
          </div>
        </div>

        <div class="board-wrapper">
          <div class="board" id="game-board">
            ${Array(9).fill(null).map((_, i) => `<div class="cell" data-index="${i}"></div>`).join('')}
          </div>
        </div>

        <div class="game-player-panel">
          <div class="player-card-game" id="card-o">
            <div class="player-card-top">
              <div class="player-symbol symbol-o">O</div>
              <div><div class="player-name-game">${oName}</div><div class="player-rating-game">Rating: ${oRating}${gs.isAI ? ` (${gs.aiDifficulty})` : ''}</div></div>
            </div>
            ${timerO}
          </div>
          ${gs.isAI ? `<div class="card card-sm" style="text-align:center">
            <div style="font-size:1.8rem;margin-bottom:6px">🤖</div>
            <div style="font-weight:700">${gs.aiDifficulty.charAt(0).toUpperCase()+gs.aiDifficulty.slice(1)} AI</div>
            <div class="text-muted text-sm mt-1">${gs.aiDifficulty==='hard'?'Perfect strategy':gs.aiDifficulty==='medium'?'Smart moves':'Casual play'}</div>
          </div>` : ''}
        </div>
      </div>
      <div class="game-controls">
        <button class="btn btn-secondary" id="new-game-btn">New Game</button>
        <button class="btn btn-danger"    id="resign-btn">Resign</button>
      </div>
    </div>`;
  };

  const fmtTime = (s) => {
    if (s == null) return '';
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  };

  const renderDashboard = () => {
    const stats   = state.data.stats   || {};
    const players = state.data.players || [];
    const games   = state.data.games   || [];
    const q       = (state.dashSearch || '').toLowerCase();
    const filtered = q ? games.filter(g => g.playerX.toLowerCase().includes(q) || g.playerO.toLowerCase().includes(q)) : games;

    const total = stats.totalGames || 0;
    const xPct  = total ? Math.round((stats.xWins  || 0) / total * 100) : 0;
    const oPct  = total ? Math.round((stats.oWins  || 0) / total * 100) : 0;
    const dPct  = total ? Math.round((stats.draws  || 0) / total * 100) : 0;

    return `
    <div class="dashboard-view">
      <div style="margin-bottom:32px">
        <h1 style="font-size:2rem;font-weight:900;letter-spacing:-0.5px;margin-bottom:6px">Game Database</h1>
        <p class="text-muted">Live view of all data stored in MySQL</p>
      </div>

      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin-bottom:32px">
        <div class="stat-card"><div class="stat-num" style="color:var(--accent)">${stats.totalGames||0}</div><div class="stat-label">Total Games</div></div>
        <div class="stat-card"><div class="stat-num" style="color:var(--text)">${stats.totalPlayers||0}</div><div class="stat-label">Players</div></div>
        <div class="stat-card stat-wins"><div class="stat-num">${stats.xWins||0}</div><div class="stat-label">X Wins (${xPct}%)</div></div>
        <div class="stat-card stat-losses"><div class="stat-num">${stats.oWins||0}</div><div class="stat-label">O Wins (${oPct}%)</div></div>
        <div class="stat-card stat-draws"><div class="stat-num">${stats.draws||0}</div><div class="stat-label">Draws (${dPct}%)</div></div>
        <div class="stat-card"><div class="stat-num" style="color:var(--gold)">${stats.topRating||1200}</div><div class="stat-label">Top Rating</div></div>
      </div>

      <div class="db-section">
        <div class="db-section-header">
          <div class="db-section-title">👤 Player Stats <span class="badge badge-blue">${players.length}</span></div>
        </div>
        <div class="db-table-wrap">
          <table class="db-table">
            <thead><tr><th>#</th><th>Player</th><th>Rating</th><th>Games</th><th>Wins</th><th>Losses</th><th>Draws</th><th>Win %</th><th>Streak</th><th>Best Streak</th><th>AI Wins</th></tr></thead>
            <tbody>
              ${players.length ? players.map((p, i) => {
                const wr = p.gamesPlayed ? Math.round(p.wins / p.gamesPlayed * 100) : 0;
                const medals = ['🥇','🥈','🥉'];
                return `<tr>
                  <td class="rank-col">${i < 3 ? `<span class="rank-medal">${medals[i]}</span>` : `#${i+1}`}</td>
                  <td><div class="flex items-center gap-1"><span style="font-weight:600">${p.username}</span>${p.rating>=1800?'<span class="badge badge-gold">👑</span>':p.rating>=1500?'<span class="badge badge-purple">🏆</span>':''}</div></td>
                  <td class="rating-col">${p.rating}</td>
                  <td class="font-mono text-sm">${p.gamesPlayed}</td>
                  <td class="result-win fw-bold">${p.wins}</td>
                  <td class="result-loss fw-bold">${p.losses}</td>
                  <td class="result-draw fw-bold">${p.draws}</td>
                  <td><div class="winrate-bar-wrap"><div class="winrate-bar"><div class="winrate-fill" style="width:${wr}%"></div></div><span class="winrate-pct">${wr}%</span></div></td>
                  <td class="font-mono text-sm">${p.currentStreak}</td>
                  <td class="font-mono text-sm">${p.maxStreak}</td>
                  <td class="font-mono text-sm">${p.aiWins||0}</td>
                </tr>`;
              }).join('') : `<tr><td colspan="11"><div class="empty-state"><div class="empty-state-icon">🎮</div><div class="empty-state-text">No players yet. Play a game to appear here.</div></div></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="db-section" style="margin-top:28px">
        <div class="db-section-header">
          <div class="db-section-title">📋 All Games <span class="badge badge-blue">${games.length}</span></div>
          <input class="input" id="dash-search" placeholder="Filter by player name…" value="${state.dashSearch||''}" style="width:220px">
        </div>
        <div class="db-table-wrap">
          <table class="db-table" id="games-table">
            <thead><tr><th>#</th><th>Game ID</th><th>Player X</th><th>Player O</th><th>Winner</th><th>Mode</th><th>Moves</th><th>Duration</th><th>Date &amp; Time</th></tr></thead>
            <tbody id="games-tbody">
              ${renderGameRows(filtered)}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  };

  const renderGameRows = (games) => {
    if (!games.length) return `<tr><td colspan="9"><div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">No games found.</div></div></td></tr>`;
    return games.map((g, i) => {
      const winner = g.result === 'draw' ? '<span class="result-draw">Draw</span>'
        : g.result === 'X' ? `<span class="result-win">${g.playerX}</span>`
        : `<span class="result-loss">${g.playerO}</span>`;
      const dt = new Date(g.playedAt);
      const dateStr = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
      return `<tr>
        <td class="text-muted text-sm">${i+1}</td>
        <td class="font-mono text-xs text-muted">#${g.id}</td>
        <td style="font-weight:600;color:var(--x-color)">${g.playerX}</td>
        <td style="font-weight:600;color:var(--o-color)">${g.playerO}</td>
        <td>${winner}</td>
        <td><span class="badge ${g.mode==='ai'?'badge-purple':'badge-blue'}">${g.mode==='ai'?`AI (${g.aiDifficulty})`:'1v1'}</span></td>
        <td class="font-mono text-sm">${Array.isArray(g.moves)?g.moves.length:'—'}</td>
        <td class="text-muted text-sm">${g.duration}s</td>
        <td class="text-muted text-sm">${dateStr}</td>
      </tr>`;
    }).join('');
  };

  const bindView = () => {
    $$('[data-link]').forEach(el => {
      if (el._lb) return;
      el._lb = true;
      el.addEventListener('click', () => navigate(el.dataset.link));
    });
    if (state.view === 'lobby')     bindLobby();
    if (state.view === 'game')      bindGameView();
    if (state.view === 'dashboard') bindDashboard();
  };

  const bindLobby = () => {
    $$('.mode-card').forEach(c => c.addEventListener('click', () => {
      state.lobby.mode = c.dataset.mode;
      navigate('lobby');
    }));

    $$('.diff-btn').forEach(b => b.addEventListener('click', () => {
      state.lobby.difficulty = b.dataset.diff;
      navigate('lobby');
    }));

    $('#time-select')?.addEventListener('change', e => { state.lobby.timeControl = e.target.value; });

    $('#p1-input')?.addEventListener('input', e => { state.lobby.p1 = e.target.value.trim(); });
    $('#p2-input')?.addEventListener('input', e => { state.lobby.p2 = e.target.value.trim(); });

    $('#start-btn')?.addEventListener('click', async () => {
      const { mode, difficulty, timeControl } = state.lobby;
      const p1Name = $('#p1-input')?.value.trim() || 'Player 1';
      const p2Name = mode === 'ai' ? `Computer (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})` : ($('#p2-input')?.value.trim() || 'Player 2');
      const errEl  = $('#lobby-error');

      if (!p1Name) { errEl.textContent = 'Player 1 name is required.'; errEl.classList.remove('hidden'); return; }
      if (mode === '1v1' && !p2Name) { errEl.textContent = 'Player 2 name is required.'; errEl.classList.remove('hidden'); return; }
      if (mode === '1v1' && p1Name.toLowerCase() === p2Name.toLowerCase()) { errEl.textContent = 'Players must have different names.'; errEl.classList.remove('hidden'); return; }

      state.lobby.p1 = p1Name;
      state.lobby.p2 = p2Name;

      let ratingX = '—', ratingO = '—';
      try {
        const [px, po] = await Promise.all([
          Storage.getPlayer(p1Name),
          mode !== 'ai' ? Storage.getPlayer(p2Name) : Promise.resolve(null),
        ]);
        ratingX = px ? px.rating : CONFIG.STARTING_RATING;
        ratingO = po ? po.rating : (mode === 'ai' ? (difficulty === 'hard' ? 1600 : difficulty === 'medium' ? 1350 : 1100) : CONFIG.STARTING_RATING);
      } catch {}

      Game.init({ mode, playerX: p1Name, playerO: p2Name, isAI: mode === 'ai', aiDifficulty: difficulty, timeControl, ratingX, ratingO }, handleGameEnd);

      navigate('game').then(() => {
        Game.renderBoard();
        Game.updateStatusBar();
        Game.updateMoveHistory();
      });
    });
  };

  const bindGameView = () => {
    $('#new-game-btn')?.addEventListener('click', () => { Game.clearTimer(); navigate('lobby'); });
    $('#resign-btn')?.addEventListener('click', () => { if (confirm('Resign this game?')) Game.resign(); });
  };

  const handleGameEnd = async (result, context) => {
    const gs = Game.getState();
    if (!gs) return;

    let ratingChange = null, unlockedX = [], unlockedO = [];

    try {
      const res = await Storage.saveGame({
        playerX:      gs.playerX,
        playerO:      gs.playerO,
        result:       result.winner,
        mode:         gs.mode,
        aiDifficulty: gs.aiDifficulty || null,
        moves:        gs.moves ? gs.moves.map(m => m.index) : [],
        duration:     gs.endedAt ? Math.round((gs.endedAt - gs.startedAt) / 1000) : 0,
        playedAt:     Date.now(),
        context:      context || {},
      });
      if (res) {
        ratingChange = res.ratingChange;
        unlockedX    = res.unlockedX || [];
        unlockedO    = res.unlockedO || [];
      }
    } catch (e) { console.error('handleGameEnd:', e); }

    unlockedX.forEach(id => {
      const a = CONFIG.ACHIEVEMENTS.find(a => a.id === id);
      if (a) setTimeout(() => toast(`${a.icon} Achievement Unlocked: ${a.name}!`, 'achievement', 5000), 1500);
    });

    showResultOverlay(result, gs, ratingChange);
  };

  const showResultOverlay = (result, gs, ratingChange) => {
    let emoji, title, sub;
    if (result.winner === 'draw') {
      emoji = '🤝'; title = "It's a Draw!"; sub = 'Perfectly balanced.';
    } else if (result.resigned) {
      const w = result.winner === 'X' ? gs.playerX : (gs.isAI ? 'Computer' : gs.playerO);
      emoji = '🏳️'; title = `${w} Wins!`; sub = 'by resignation';
    } else if (result.timeout) {
      const w = result.winner === 'X' ? gs.playerX : (gs.isAI ? 'Computer' : gs.playerO);
      emoji = '⏰'; title = `${w} Wins!`; sub = 'on time';
    } else {
      const w = result.winner === 'X' ? gs.playerX : (gs.isAI ? 'Computer' : gs.playerO);
      emoji = result.winner === 'X' ? '🎉' : (gs.isAI ? '🤖' : '🎊');
      title = `${w} Wins!`;
      sub   = `Won in ${gs.moves ? gs.moves.length : '?'} moves`;
    }

    const ratingHTML = ratingChange ? `
    <div class="rating-change-display">
      <div class="rating-change-item">
        <div class="rating-change-name">${gs.playerX}</div>
        <div class="rating-change-val">${ratingChange.newX}</div>
        <div class="rating-change-delta ${ratingChange.deltaX>0?'delta-pos':ratingChange.deltaX<0?'delta-neg':'delta-zero'}">${ratingChange.deltaX>0?'+':''}${ratingChange.deltaX}</div>
      </div>
      ${ratingChange.newO!=null?`<div class="rating-change-item">
        <div class="rating-change-name">${gs.isAI?'Computer':gs.playerO}</div>
        <div class="rating-change-val">${ratingChange.newO}</div>
        <div class="rating-change-delta ${ratingChange.deltaO>0?'delta-pos':ratingChange.deltaO<0?'delta-neg':'delta-zero'}">${ratingChange.deltaO>0?'+':''}${ratingChange.deltaO}</div>
      </div>`:''}
    </div>` : '';

    const ov = document.createElement('div');
    ov.className = 'result-overlay';
    ov.innerHTML = `
    <div class="result-card">
      <div class="result-emoji">${emoji}</div>
      <div class="result-title">${title}</div>
      <div class="result-sub">${sub}</div>
      ${ratingHTML}
      <div class="flex gap-1 justify-center">
        <button class="btn btn-primary" id="res-again">Play Again</button>
        <button class="btn btn-secondary" id="res-lobby">Lobby</button>
        <button class="btn btn-secondary" id="res-dash">Dashboard</button>
      </div>
    </div>`;
    document.body.appendChild(ov);

    ov.querySelector('#res-again')?.addEventListener('click', () => {
      ov.remove();
      const s = Game.getState();
      Game.init({ mode: s.mode, playerX: s.playerX, playerO: s.playerO, isAI: s.isAI, aiDifficulty: s.aiDifficulty, timeControl: s.timeControl, ratingX: s.ratingX, ratingO: s.ratingO }, handleGameEnd);
      Game.renderBoard(); Game.updateStatusBar(); Game.updateMoveHistory();
    });
    ov.querySelector('#res-lobby')?.addEventListener('click', () => { ov.remove(); Game.clearTimer(); navigate('lobby'); });
    ov.querySelector('#res-dash')?.addEventListener('click',  () => { ov.remove(); Game.clearTimer(); navigate('dashboard'); });
  };

  const bindDashboard = () => {
    $('#dash-search')?.addEventListener('input', (e) => {
      state.dashSearch = e.target.value;
      const q       = state.dashSearch.toLowerCase();
      const games   = state.data.games || [];
      const filtered = q ? games.filter(g => g.playerX.toLowerCase().includes(q) || g.playerO.toLowerCase().includes(q)) : games;
      const tbody   = $('#games-tbody');
      if (tbody) tbody.innerHTML = renderGameRows(filtered);
    });
  };

  const initApp = async () => {
    const settings = Storage.getSettings();
    const theme    = settings.theme || 'dark';
    document.documentElement.dataset.theme = theme;
    updateThemeIcon(theme);

    $('#theme-toggle')?.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      Storage.saveSettings({ theme: next });
      updateThemeIcon(next);
    });

    $('#hamburger')?.addEventListener('click', () => {
      $('#mobile-menu')?.classList.toggle('hidden');
    });

    await navigate('home');
  };

  const updateThemeIcon = (theme) => {
    $('.icon-sun')?.classList.toggle('hidden', theme !== 'dark');
    $('.icon-moon')?.classList.toggle('hidden', theme === 'dark');
  };

  document.addEventListener('DOMContentLoaded', initApp);

  return { navigate, toast };
})();
