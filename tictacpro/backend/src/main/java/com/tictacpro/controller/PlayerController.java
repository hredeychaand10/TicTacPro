package com.tictacpro.controller;

import com.tictacpro.model.Player;
import com.tictacpro.repository.PlayerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerRepository playerRepo;

    public PlayerController(PlayerRepository playerRepo) {
        this.playerRepo = playerRepo;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllPlayers() {
        List<Map<String, Object>> players = playerRepo.findAllWithGamesPlayed()
            .stream()
            .map(this::format)
            .collect(Collectors.toList());
        return ResponseEntity.ok(players);
    }

    @GetMapping("/{username}")
    public ResponseEntity<Map<String, Object>> getPlayer(@PathVariable String username) {
        return playerRepo.findByUsername(username)
            .map(p -> ResponseEntity.ok(format(p)))
            .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> format(Player p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("username",      p.getUsername());
        m.put("avatar",        p.getAvatar());
        m.put("rating",        p.getRating());
        m.put("wins",          p.getWins());
        m.put("losses",        p.getLosses());
        m.put("draws",         p.getDraws());
        m.put("gamesPlayed",   p.getGamesPlayed());
        m.put("currentStreak", p.getCurrentStreak());
        m.put("maxStreak",     p.getMaxStreak());
        m.put("drawCount",     p.getDrawCount());
        m.put("aiWins",        p.getAiWins());
        m.put("aiHardWins",    p.getAiHardWins());
        m.put("achievements",  p.getAchievements());
        m.put("ratingHistory", p.getRatingHistory());
        m.put("joinedAt",      p.getJoinedAt());
        m.put("updatedAt",     p.getUpdatedAt());
        return m;
    }
}
