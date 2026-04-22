const Game = (() => {
  let state = null;
  let timerInterval = null;
  let onGameEnd = null;

  const init = (opts, endCallback) => {
    clearTimer();
    onGameEnd = endCallback;
    state = {
      board: Array(9).fill(null),
      current: 'X',
      moves: [],
      status: 'playing',
      mode: opts.mode,
      playerX: opts.playerX,
      playerO: opts.playerO,
      isAI: opts.isAI,
      aiDifficulty: opts.aiDifficulty,
      boardTheme: 'default',
      timeControl: opts.timeControl,
      ratingX: opts.ratingX || '—',
      ratingO: opts.ratingO || '—',
      timerX: opts.timeControl ? CONFIG.TIMER_SECONDS[opts.timeControl] : null,
      timerO: opts.timeControl ? CONFIG.TIMER_SECONDS[opts.timeControl] : null,
      startedAt: Date.now(),
      firstMoveCorner: false,
      wasNearLoss: false,
    };
  };

  const getState = () => state;

  const checkWinner = (board) => {
    for (const combo of CONFIG.WIN_COMBOS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], combo };
      }
    }
    if (board.every(c => c)) return { winner: 'draw', combo: null };
    return null;
  };

  const makeMove = (index) => {
    if (!state || state.status !== 'playing') return false;
    if (state.board[index]) return false;
    if (state.isAI && state.current === 'O') return false;

    state.board[index] = state.current;
    state.moves.push({ player: state.current, index, moveNum: state.moves.length + 1 });

    if (state.moves.length === 1 && [0, 2, 6, 8].includes(index)) {
      state.firstMoveCorner = true;
    }

    const result = checkWinner(state.board);
    if (result) {
      endGame(result);
    } else {
      state.current = state.current === 'X' ? 'O' : 'X';
      if (state.isAI && state.current === 'O' && state.status === 'playing') {
        scheduleAIMove();
      }
    }

    renderBoard();
    updateStatusBar();
    if (state.timeControl) startTimer();
    return true;
  };

  const scheduleAIMove = () => {
    const delay = CONFIG.AI_THINK_MS[state.aiDifficulty];
    setTimeout(() => {
      if (!state || state.status !== 'playing' || state.current !== 'O') return;
      const move = AI.getMove([...state.board], state.aiDifficulty);
      if (move !== null && move !== undefined) {
        state.board[move] = 'O';
        state.moves.push({ player: 'O', index: move, moveNum: state.moves.length + 1 });

        const result = checkWinner(state.board);
        if (result) {
          renderBoard();
          endGame(result);
        } else {
          state.current = 'X';
          renderBoard();
          updateStatusBar();
        }
        updateMoveHistory();
      }
    }, delay);
  };

  const endGame = (result) => {
    state.status = 'ended';
    state.result = result;
    state.endedAt = Date.now();
    clearTimer();

    const moveCount = state.moves.length;
    const winnerPlayer = result.winner !== 'draw' ? result.winner : null;
    const opponentPiece = winnerPlayer === 'X' ? 'O' : 'X';
    const opponentNeverThreatened = winnerPlayer && !CONFIG.WIN_COMBOS.some(([a, b, c]) => {
      const snap = state.board;
      return snap[a] === opponentPiece && snap[b] === opponentPiece;
    });

    const context = {
      wonIn5: winnerPlayer && moveCount <= 5,
      isFlawless: winnerPlayer && opponentNeverThreatened,
      isComeback: state.wasNearLoss,
      firstMoveCorner: state.firstMoveCorner,
    };

    renderBoard(result.combo);
    updateStatusBar();

    setTimeout(() => {
      if (onGameEnd) onGameEnd(result, context);
    }, 800);
  };

  const resign = () => {
    if (!state || state.status !== 'playing') return;
    const loser = state.current;
    const winner = loser === 'X' ? 'O' : 'X';
    endGame({ winner, combo: null, resigned: true });
  };

  const startTimer = () => {
    clearTimer();
    if (!state.timeControl || !CONFIG.TIMER_SECONDS[state.timeControl]) return;
    timerInterval = setInterval(() => {
      if (!state || state.status !== 'playing') { clearTimer(); return; }
      const key = state.current === 'X' ? 'timerX' : 'timerO';
      state[key]--;
      updateTimerDisplay();
      if (state[key] <= 0) {
        clearTimer();
        const loser = state.current;
        const winner = loser === 'X' ? 'O' : 'X';
        endGame({ winner, combo: null, timeout: true });
      }
    }, 1000);
  };

  const clearTimer = () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  };

  const updateTimerDisplay = () => {
    const tx = document.getElementById('timer-x');
    const to = document.getElementById('timer-o');
    if (tx && state) tx.textContent = formatTime(state.timerX);
    if (to && state) to.textContent = formatTime(state.timerO);
    if (tx && state && state.current === 'X' && state.timerX <= 10) tx.classList.add('warning');
    if (to && state && state.current === 'O' && state.timerO <= 10) to.classList.add('warning');
  };

  const formatTime = (s) => {
    if (s === null) return '';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const renderBoard = (winCombo) => {
    const boardEl = document.getElementById('game-board');
    if (!boardEl || !state) return;

    boardEl.className = `board theme-${state.boardTheme}`;
    boardEl.innerHTML = state.board.map((cell, i) => {
      let cls = 'cell';
      if (cell) cls += ' taken';
      const isWin = winCombo && winCombo.includes(i);
      if (isWin) cls += cell === 'X' ? ' win-cell-x' : ' win-cell-o';

      const piece = cell === 'X' ? '<div class="piece-x"></div>' : cell === 'O' ? '<div class="piece-o"></div>' : '';
      return `<div class="${cls}" data-index="${i}">${piece}</div>`;
    }).join('');

    boardEl.querySelectorAll('.cell:not(.taken)').forEach(cell => {
      cell.addEventListener('click', () => {
        const idx = parseInt(cell.dataset.index);
        if (makeMove(idx)) updateMoveHistory();
      });
    });
  };

  const updateStatusBar = () => {
    const bar = document.getElementById('game-status');
    if (!bar || !state) return;
    bar.className = 'game-status-bar';

    if (state.status === 'ended') {
      bar.classList.add('result');
      const r = state.result;
      if (r.winner === 'draw') bar.textContent = "It's a Draw!";
      else if (r.resigned) bar.textContent = `${r.winner === 'X' ? state.playerX : (state.isAI ? 'Computer' : state.playerO)} wins by resignation`;
      else if (r.timeout) bar.textContent = `${r.winner === 'X' ? state.playerX : (state.isAI ? 'Computer' : state.playerO)} wins on time`;
      else bar.textContent = `${r.winner === 'X' ? state.playerX : (state.isAI ? 'Computer' : state.playerO)} wins!`;
    } else {
      const name = state.current === 'X' ? state.playerX : (state.isAI ? 'Computer' : state.playerO);
      bar.classList.add(state.current === 'X' ? 'x-turn' : 'o-turn');
      bar.textContent = `${name}'s turn`;
    }
  };

  const updateMoveHistory = () => {
    const list = document.getElementById('move-list');
    if (!list || !state) return;
    list.innerHTML = state.moves.map(m => {
      const pos = `R${Math.floor(m.index / 3) + 1}C${(m.index % 3) + 1}`;
      return `<div class="move-item"><span class="move-num">${m.moveNum}.</span><span class="move-${m.player.toLowerCase()}">${m.player} → ${pos}</span></div>`;
    }).join('');
    list.scrollTop = list.scrollHeight;
  };

  const getGameRecord = () => {
    if (!state) return null;
    return {
      playerX: state.playerX,
      playerO: state.isAI ? 'Computer' : state.playerO,
      result: state.result ? state.result.winner : null,
      mode: state.mode,
      aiDifficulty: state.isAI ? state.aiDifficulty : null,
      moves: state.moves.map(m => m.index),
      duration: state.endedAt ? Math.round((state.endedAt - state.startedAt) / 1000) : 0,
      playedAt: Date.now(),
    };
  };

  return { init, getState, makeMove, resign, renderBoard, updateStatusBar, updateMoveHistory, getGameRecord, clearTimer };
})();
