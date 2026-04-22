package com.tictacpro.controller;

import com.tictacpro.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(gameService.getStats());
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getGames(
        @RequestParam(required = false) String username,
        @RequestParam(defaultValue = "200") int limit
    ) {
        return ResponseEntity.ok(gameService.getGames(username, limit));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> saveGame(@RequestBody Map<String, Object> body) {
        if (!body.containsKey("playerX") || !body.containsKey("playerO")
                || !body.containsKey("result") || !body.containsKey("mode")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }
        try {
            return ResponseEntity.ok(gameService.saveGame(body));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
