package com.tictacpro.service;

import com.tictacpro.model.Player;
import com.tictacpro.repository.GameRepository;
import com.tictacpro.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GameService {

    private final GameRepository gameRepo;
    private final PlayerRepository playerRepo;
    private final EloService elo;
    private final AchievementService achievements;

    public GameService(GameRepository gameRepo, PlayerRepository playerRepo,
                       EloService elo, AchievementService achievements) {
        this.gameRepo    = gameRepo;
        this.playerRepo  = playerRepo;
        this.elo         = elo;
        this.achievements = achievements;
    }

    public Map<String, Object> getStats() {
        return gameRepo.getStats();
    }

    public List<Map<String, Object>> getGames(String username, int limit) {
        int cap = Math.min(limit, 1000);
        return username != null && !username.isBlank()
            ? gameRepo.findByUsername(username, cap)
            : gameRepo.findAll(cap);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> saveGame(Map<String, Object> body) {
        String playerX      = (String) body.get("playerX");
        String playerO      = (String) body.get("playerO");
        String result       = (String) body.get("result");
        String mode         = (String) body.get("mode");
        String aiDifficulty = (String) body.get("aiDifficulty");
        List<Integer> moves = (List<Integer>) body.getOrDefault("moves", new ArrayList<>());
        int duration        = body.containsKey("duration") ? ((Number) body.get("duration")).intValue() : 0;
        long playedAt       = body.containsKey("playedAt") ? ((Number) body.get("playedAt")).longValue() : System.currentTimeMillis();
        Map<String, Object> context = (Map<String, Object>) body.getOrDefault("context", new HashMap<>());

        gameRepo.save(playerX, playerO, result, mode, aiDifficulty, moves, duration, playedAt);

        boolean isAI   = "ai".equals(mode);
        double  scoreX = "X".equals(result) ? 1.0 : "O".equals(result) ? 0.0 : 0.5;
        int aiRating   = "hard".equals(aiDifficulty) ? 1600 : "medium".equals(aiDifficulty) ? 1350 : 1100;

        Player pX = playerRepo.getOrCreate(playerX);
        Player pO = isAI ? null : playerRepo.getOrCreate(playerO);

        int rO = isAI ? aiRating : pO.getRating();
        int gO = isAI ? 999      : pO.getGamesPlayed();

        EloService.EloResult eloX = elo.calculate(pX.getRating(), rO, scoreX, pX.getGamesPlayed(), gO);

        boolean wonX  = "X".equals(result);
        boolean drewX = "draw".equals(result);
        boolean firstMoveCorner = Boolean.TRUE.equals(context.get("firstMoveCorner"));
        boolean wonIn5          = Boolean.TRUE.equals(context.get("wonIn5"));

        List<String> unlockedX = updatePlayer(pX, wonX, drewX, isAI, aiDifficulty, eloX.newA,
            isAI ? null : playerO, firstMoveCorner, wonX && wonIn5);

        List<String> unlockedO = new ArrayList<>();
        int deltaO = 0, newRatingO = 0;

        if (!isAI && pO != null) {
            EloService.EloResult eloO = elo.calculate(pO.getRating(), pX.getRating(), 1 - scoreX, pO.getGamesPlayed(), pX.getGamesPlayed());
            unlockedO  = updatePlayer(pO, "O".equals(result), drewX, false, null, eloO.newA, playerX, false, false);
            deltaO     = eloO.deltaA;
            newRatingO = eloO.newA;
        }

        Map<String, Object> ratingChange = new LinkedHashMap<>();
        ratingChange.put("deltaX", eloX.deltaA);
        ratingChange.put("newX",   eloX.newA);
        if (pO != null) {
            ratingChange.put("deltaO", deltaO);
            ratingChange.put("newO",   newRatingO);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success",      true);
        response.put("ratingChange", ratingChange);
        response.put("unlockedX",    unlockedX);
        response.put("unlockedO",    unlockedO);
        return response;
    }

    private List<String> updatePlayer(Player p, boolean won, boolean drew, boolean isAI,
                                      String aiDiff, int newRating, String opponent,
                                      boolean firstMoveCorner, boolean wonIn5) {
        p.setRating(newRating);
        p.setWins(p.getWins()     + (won               ? 1 : 0));
        p.setLosses(p.getLosses() + (!won && !drew      ? 1 : 0));
        p.setDraws(p.getDraws()   + (drew               ? 1 : 0));
        p.setGamesPlayed(p.getGamesPlayed() + 1);
        p.setCurrentStreak(won ? p.getCurrentStreak() + 1 : 0);
        p.setMaxStreak(won ? Math.max(p.getMaxStreak(), p.getCurrentStreak()) : p.getMaxStreak());
        p.setDrawCount(p.getDrawCount() + (drew ? 1 : 0));
        p.setAiWins(p.getAiWins()         + (isAI && won ? 1 : 0));
        p.setAiHardWins(p.getAiHardWins() + (isAI && "hard".equals(aiDiff) && won ? 1 : 0));

        if (isAI && "hard".equals(aiDiff)) {
            p.setAiHardStreak(won ? p.getAiHardStreak() + 1 : 0);
        }

        p.setCornerWins(p.getCornerWins() + (won && firstMoveCorner ? 1 : 0));
        p.setWonIn5(wonIn5);

        List<Map<String, Object>> hist = new ArrayList<>(p.getRatingHistory());
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("rating", newRating);
        entry.put("date",   System.currentTimeMillis());
        hist.add(entry);
        if (hist.size() > 100) hist = hist.subList(hist.size() - 100, hist.size());
        p.setRatingHistory(hist);

        if (opponent != null && !p.getOpponents().contains(opponent)) {
            List<String> opp = new ArrayList<>(p.getOpponents());
            opp.add(opponent);
            p.setOpponents(opp);
        }

        List<String> unlocked = achievements.process(p);
        playerRepo.update(p);
        return unlocked;
    }
}
