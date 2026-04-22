package com.tictacpro.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tictacpro.model.Player;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class PlayerRepository {

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public PlayerRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private Player mapRow(ResultSet rs, int rowNum) throws SQLException {
        Player p = new Player();
        p.setId(rs.getLong("id"));
        p.setUsername(rs.getString("username"));
        p.setAvatar(rs.getString("avatar"));
        p.setRating(rs.getInt("rating"));
        p.setWins(rs.getInt("wins"));
        p.setLosses(rs.getInt("losses"));
        p.setDraws(rs.getInt("draws"));
        p.setGamesPlayed(rs.getInt("games_played"));
        p.setCurrentStreak(rs.getInt("current_streak"));
        p.setMaxStreak(rs.getInt("max_streak"));
        p.setDrawCount(rs.getInt("draw_count"));
        p.setAiWins(rs.getInt("ai_wins"));
        p.setAiHardWins(rs.getInt("ai_hard_wins"));
        p.setAiHardStreak(rs.getInt("ai_hard_streak"));
        p.setCornerWins(rs.getInt("corner_wins"));
        p.setJoinedAt(rs.getLong("joined_at"));
        p.setUpdatedAt(rs.getLong("updated_at"));
        try {
            String ach = rs.getString("achievements");
            String hist = rs.getString("rating_history");
            String opp  = rs.getString("opponents");
            p.setAchievements(mapper.readValue(ach != null ? ach : "[]", new TypeReference<List<String>>() {}));
            p.setRatingHistory(mapper.readValue(hist != null ? hist : "[]", new TypeReference<List<Map<String, Object>>>() {}));
            p.setOpponents(mapper.readValue(opp != null ? opp : "[]", new TypeReference<List<String>>() {}));
        } catch (Exception e) {
            p.setAchievements(new ArrayList<>());
            p.setRatingHistory(new ArrayList<>());
            p.setOpponents(new ArrayList<>());
        }
        return p;
    }

    public Optional<Player> findByUsername(String username) {
        try {
            Player p = jdbc.queryForObject(
                "SELECT * FROM players WHERE username = ?",
                this::mapRow, username
            );
            return Optional.ofNullable(p);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Player getOrCreate(String username) {
        String history = "[{\"rating\":1200,\"date\":" + System.currentTimeMillis() + "}]";
        jdbc.update(
            "INSERT OR IGNORE INTO players (username, rating_history) VALUES (?, ?)",
            username, history
        );
        return findByUsername(username).orElseThrow();
    }

    public List<Player> findAllWithGamesPlayed() {
        return jdbc.query(
            "SELECT * FROM players WHERE games_played > 0 ORDER BY rating DESC LIMIT 200",
            this::mapRow
        );
    }

    public void update(Player p) {
        try {
            jdbc.update(
                "UPDATE players SET rating=?, wins=?, losses=?, draws=?, games_played=?, " +
                "current_streak=?, max_streak=?, draw_count=?, ai_wins=?, ai_hard_wins=?, " +
                "ai_hard_streak=?, corner_wins=?, opponents=?, achievements=?, " +
                "rating_history=?, updated_at=? WHERE username=?",
                p.getRating(), p.getWins(), p.getLosses(), p.getDraws(), p.getGamesPlayed(),
                p.getCurrentStreak(), p.getMaxStreak(), p.getDrawCount(),
                p.getAiWins(), p.getAiHardWins(), p.getAiHardStreak(), p.getCornerWins(),
                mapper.writeValueAsString(p.getOpponents()),
                mapper.writeValueAsString(p.getAchievements()),
                mapper.writeValueAsString(p.getRatingHistory()),
                System.currentTimeMillis(),
                p.getUsername()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to update player: " + p.getUsername(), e);
        }
    }
}
