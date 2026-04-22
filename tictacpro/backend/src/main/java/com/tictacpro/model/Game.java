package com.tictacpro.model;

import java.util.List;

public class Game {
    private Long id;
    private String playerX;
    private String playerO;
    private String result;
    private String mode;
    private String aiDifficulty;
    private List<Integer> moves;
    private int duration;
    private long playedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlayerX() { return playerX; }
    public void setPlayerX(String playerX) { this.playerX = playerX; }

    public String getPlayerO() { return playerO; }
    public void setPlayerO(String playerO) { this.playerO = playerO; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getAiDifficulty() { return aiDifficulty; }
    public void setAiDifficulty(String aiDifficulty) { this.aiDifficulty = aiDifficulty; }

    public List<Integer> getMoves() { return moves; }
    public void setMoves(List<Integer> moves) { this.moves = moves; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public long getPlayedAt() { return playedAt; }
    public void setPlayedAt(long playedAt) { this.playedAt = playedAt; }
}
