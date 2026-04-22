package com.tictacpro.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class GameRepository {

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public GameRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void save(String playerX, String playerO, String result, String mode,
                     String aiDifficulty, List<Integer> moves, int duration, long playedAt) {
        try {
            jdbc.update(
                "INSERT INTO games (player_x, player_o, result, mode, ai_difficulty, moves, duration, played_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                playerX, playerO, result, mode, aiDifficulty,
                mapper.writeValueAsString(moves != null ? moves : new ArrayList<>()),
                duration, playedAt
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to save game", e);
        }
    }

    public List<Map<String, Object>> findAll(int limit) {
        return jdbc.query(
            "SELECT * FROM games ORDER BY played_at DESC LIMIT ?",
            (rs, rowNum) -> mapRow(rs), limit
        );
    }

    public List<Map<String, Object>> findByUsername(String username, int limit) {
        return jdbc.query(
            "SELECT * FROM games WHERE player_x = ? OR player_o = ? ORDER BY played_at DESC LIMIT ?",
            (rs, rowNum) -> mapRow(rs), username, username, limit
        );
    }

    public Map<String, Object> getStats() {
        long totalPlayers = jdbc.queryForObject("SELECT COUNT(*) FROM players", Long.class);
        long totalGames   = jdbc.queryForObject("SELECT COUNT(*) FROM games", Long.class);
        long xWins        = jdbc.queryForObject("SELECT COUNT(*) FROM games WHERE result = 'X'", Long.class);
        long oWins        = jdbc.queryForObject("SELECT COUNT(*) FROM games WHERE result = 'O'", Long.class);
        long draws        = jdbc.queryForObject("SELECT COUNT(*) FROM games WHERE result = 'draw'", Long.class);
        Integer topRating = jdbc.queryForObject("SELECT COALESCE(MAX(rating), 1200) FROM players", Integer.class);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalPlayers", totalPlayers);
        stats.put("totalGames",   totalGames);
        stats.put("xWins",        xWins);
        stats.put("oWins",        oWins);
        stats.put("draws",        draws);
        stats.put("topRating",    topRating != null ? topRating : 1200);
        return stats;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        Map<String, Object> g = new LinkedHashMap<>();
        g.put("id",           rs.getLong("id"));
        g.put("playerX",      rs.getString("player_x"));
        g.put("playerO",      rs.getString("player_o"));
        g.put("result",       rs.getString("result"));
        g.put("mode",         rs.getString("mode"));
        g.put("aiDifficulty", rs.getString("ai_difficulty"));
        g.put("duration",     rs.getInt("duration"));
        g.put("playedAt",     rs.getLong("played_at"));
        try {
            String movesJson = rs.getString("moves");
            g.put("moves", mapper.readValue(movesJson != null ? movesJson : "[]", List.class));
        } catch (Exception e) {
            g.put("moves", new ArrayList<>());
        }
        return g;
    }
}
