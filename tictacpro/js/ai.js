const AI = (() => {
  const checkWinner = (board) => {
    for (const [a, b, c] of CONFIG.WIN_COMBOS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return board.every(c => c) ? 'draw' : null;
  };

  const minimax = (board, depth, alpha, beta, isMax) => {
    const winner = checkWinner(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'draw') return 0;

    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = 'O';
          best = Math.max(best, minimax(board, depth + 1, alpha, beta, false));
          board[i] = null;
          alpha = Math.max(alpha, best);
          if (beta <= alpha) break;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = 'X';
          best = Math.min(best, minimax(board, depth + 1, alpha, beta, true));
          board[i] = null;
          beta = Math.min(beta, best);
          if (beta <= alpha) break;
        }
      }
      return best;
    }
  };

  const getBestMove = (board) => {
    let bestVal = -Infinity, bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const val = minimax(board, 0, -Infinity, Infinity, false);
        board[i] = null;
        if (val > bestVal) { bestVal = val; bestMove = i; }
      }
    }
    return bestMove;
  };

  const getRandomMove = (board) => {
    const empty = board.map((c, i) => c ? null : i).filter(i => i !== null);
    return empty[Math.floor(Math.random() * empty.length)];
  };

  const getMediumMove = (board) => {
    const empty = board.map((c, i) => c ? null : i).filter(i => i !== null);

    for (const i of empty) {
      board[i] = 'O';
      if (checkWinner(board) === 'O') { board[i] = null; return i; }
      board[i] = null;
    }

    for (const i of empty) {
      board[i] = 'X';
      if (checkWinner(board) === 'X') { board[i] = null; return i; }
      board[i] = null;
    }

    if (!board[4]) return 4;

    const corners = [0, 2, 6, 8].filter(i => !board[i]);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

    return getRandomMove(board);
  };

  const getMove = (board, difficulty) => {
    const boardCopy = [...board];
    if (difficulty === 'easy') {
      return Math.random() < 0.2 ? getMediumMove(boardCopy) : getRandomMove(boardCopy);
    }
    if (difficulty === 'medium') return getMediumMove(boardCopy);
    return getBestMove(boardCopy);
  };

  return { getMove };
})();
