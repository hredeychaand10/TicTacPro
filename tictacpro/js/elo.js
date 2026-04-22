const ELO = (() => {
  const expected = (rA, rB) => 1 / (1 + Math.pow(10, (rB - rA) / 400));

  const kFactor = (games) => games < CONFIG.ESTABLISHED_GAMES ? CONFIG.K_FACTOR_NEW : CONFIG.K_FACTOR_EST;

  const calculate = (rA, rB, scoreA, gamesA, gamesB) => {
    const expA = expected(rA, rB);
    const kA = kFactor(gamesA);
    const kB = kFactor(gamesB);
    const deltaA = Math.round(kA * (scoreA - expA));
    const deltaB = Math.round(kB * ((1 - scoreA) - (1 - expA)));
    return {
      newA: Math.max(100, rA + deltaA),
      newB: Math.max(100, rB + deltaB),
      deltaA,
      deltaB,
    };
  };

  const checkAchievements = (player, context) => {
    const unlocked = [];
    const has = (id) => (player.achievements || []).includes(id);
    const unlock = (id) => { if (!has(id)) { player.achievements.push(id); unlocked.push(id); } };

    if (player.wins >= 1) unlock('first_win');
    if (player.currentStreak >= 3) unlock('hat_trick');
    if (player.currentStreak >= 5) unlock('win_streak_5');
    if (player.currentStreak >= 10) unlock('win_streak_10');
    if (player.gamesPlayed >= 100) unlock('veteran');
    if (player.rating >= 1300) unlock('rating_1300');
    if (player.rating >= 1500) unlock('rating_1500');
    if (player.rating >= 1800) unlock('rating_1800');
    if (player.drawCount >= 10) unlock('draw_master');
    if (player.aiHardWins >= 1) unlock('ai_slayer');
    if (player.aiHardStreak >= 5) unlock('ai_streak');
    if ((player.opponents || []).length >= 5) unlock('social');
    if (player.cornerWins >= 5) unlock('corner_master');

    if (context) {
      if (context.wonIn5) unlock('speed_demon');
      if (context.isFlawless) unlock('perfect');
      if (context.isComeback) unlock('comeback');
    }

    return unlocked;
  };

  const processGame = async (result, playerXUser, playerOUser, isAI, aiDifficulty, context) => {
    const pX = await Storage.getPlayer(playerXUser);
    const pO = playerOUser && !isAI ? await Storage.getPlayer(playerOUser) : null;

    const aiRating = isAI
      ? (aiDifficulty === 'hard' ? 1600 : aiDifficulty === 'medium' ? 1350 : 1100)
      : null;

    if (!pX) return { ratingChange: null, unlocked: [] };

    const scoreX = result === 'X' ? 1 : result === 'O' ? 0 : 0.5;
    const ratingB = isAI ? aiRating : (pO ? pO.rating : CONFIG.STARTING_RATING);
    const gamesB = isAI ? 999 : (pO ? pO.gamesPlayed : 0);
    const calc = calculate(pX.rating, ratingB, scoreX, pX.gamesPlayed, gamesB);

    pX.rating = calc.newA;
    pX.ratingHistory = [...(pX.ratingHistory || []), { rating: calc.newA, date: Date.now() }].slice(-100);
    pX.gamesPlayed = (pX.gamesPlayed || 0) + 1;
    pX.achievements = pX.achievements || [];

    if (result === 'X') {
      pX.wins = (pX.wins || 0) + 1;
      pX.currentStreak = (pX.currentStreak || 0) + 1;
      pX.maxStreak = Math.max(pX.maxStreak || 0, pX.currentStreak);
      if (isAI) {
        pX.aiWins = (pX.aiWins || 0) + 1;
        if (aiDifficulty === 'hard') {
          pX.aiHardWins = (pX.aiHardWins || 0) + 1;
          pX.aiHardStreak = (pX.aiHardStreak || 0) + 1;
        }
      }
      if (context && context.firstMoveCorner) pX.cornerWins = (pX.cornerWins || 0) + 1;
    } else if (result === 'O') {
      pX.losses = (pX.losses || 0) + 1;
      pX.currentStreak = 0;
      pX.aiHardStreak = 0;
    } else {
      pX.draws = (pX.draws || 0) + 1;
      pX.drawCount = (pX.drawCount || 0) + 1;
      pX.currentStreak = 0;
    }

    if (playerOUser && !isAI && !(pX.opponents || []).includes(playerOUser)) {
      pX.opponents = [...(pX.opponents || []), playerOUser];
    }

    const unlocked = checkAchievements(pX, result === 'X' ? context : null);
    await Storage.savePlayer(pX);

    const ratingChange = { deltaX: calc.deltaA, newX: calc.newA };

    if (pO) {
      const calcO = calculate(ratingB, pX.rating - calc.deltaA, 1 - scoreX, gamesB, pX.gamesPlayed);
      pO.rating = calcO.newA;
      pO.ratingHistory = [...(pO.ratingHistory || []), { rating: calcO.newA, date: Date.now() }].slice(-100);
      pO.gamesPlayed = (pO.gamesPlayed || 0) + 1;
      pO.achievements = pO.achievements || [];

      if (result === 'O') {
        pO.wins = (pO.wins || 0) + 1;
        pO.currentStreak = (pO.currentStreak || 0) + 1;
        pO.maxStreak = Math.max(pO.maxStreak || 0, pO.currentStreak);
      } else if (result === 'X') {
        pO.losses = (pO.losses || 0) + 1;
        pO.currentStreak = 0;
      } else {
        pO.draws = (pO.draws || 0) + 1;
        pO.drawCount = (pO.drawCount || 0) + 1;
        pO.currentStreak = 0;
      }

      if (!(pO.opponents || []).includes(playerXUser)) pO.opponents = [...(pO.opponents || []), playerXUser];
      checkAchievements(pO, result === 'O' ? context : null);
      await Storage.savePlayer(pO);
      ratingChange.deltaO = calcO.deltaA;
      ratingChange.newO = calcO.newA;
    }

    return { ratingChange, unlocked };
  };

  return { calculate, processGame, checkAchievements };
})();
