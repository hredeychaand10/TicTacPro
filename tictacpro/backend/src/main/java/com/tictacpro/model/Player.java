package com.tictacpro.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Player {
    private Long id;
    private String username;
    private String avatar = "🎮";
    private int rating = 1200;
    private int wins;
    private int losses;
    private int draws;
    private int gamesPlayed;
    private int currentStreak;
    private int maxStreak;
    private int drawCount;
    private int aiWins;
    private int aiHardWins;
    private int aiHardStreak;
    private int cornerWins;
    private List<String> opponents = new ArrayList<>();
    private List<String> achievements = new ArrayList<>();
    private List<Map<String, Object>> ratingHistory = new ArrayList<>();
    private long joinedAt;
    private long updatedAt;
    private transient boolean wonIn5;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public int getWins() { return wins; }
    public void setWins(int wins) { this.wins = wins; }

    public int getLosses() { return losses; }
    public void setLosses(int losses) { this.losses = losses; }

    public int getDraws() { return draws; }
    public void setDraws(int draws) { this.draws = draws; }

    public int getGamesPlayed() { return gamesPlayed; }
    public void setGamesPlayed(int gamesPlayed) { this.gamesPlayed = gamesPlayed; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getMaxStreak() { return maxStreak; }
    public void setMaxStreak(int maxStreak) { this.maxStreak = maxStreak; }

    public int getDrawCount() { return drawCount; }
    public void setDrawCount(int drawCount) { this.drawCount = drawCount; }

    public int getAiWins() { return aiWins; }
    public void setAiWins(int aiWins) { this.aiWins = aiWins; }

    public int getAiHardWins() { return aiHardWins; }
    public void setAiHardWins(int aiHardWins) { this.aiHardWins = aiHardWins; }

    public int getAiHardStreak() { return aiHardStreak; }
    public void setAiHardStreak(int aiHardStreak) { this.aiHardStreak = aiHardStreak; }

    public int getCornerWins() { return cornerWins; }
    public void setCornerWins(int cornerWins) { this.cornerWins = cornerWins; }

    public List<String> getOpponents() { return opponents; }
    public void setOpponents(List<String> opponents) { this.opponents = opponents; }

    public List<String> getAchievements() { return achievements; }
    public void setAchievements(List<String> achievements) { this.achievements = achievements; }

    public List<Map<String, Object>> getRatingHistory() { return ratingHistory; }
    public void setRatingHistory(List<Map<String, Object>> ratingHistory) { this.ratingHistory = ratingHistory; }

    public long getJoinedAt() { return joinedAt; }
    public void setJoinedAt(long joinedAt) { this.joinedAt = joinedAt; }

    public long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }

    public boolean isWonIn5() { return wonIn5; }
    public void setWonIn5(boolean wonIn5) { this.wonIn5 = wonIn5; }
}
