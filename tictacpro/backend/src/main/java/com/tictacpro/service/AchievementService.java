package com.tictacpro.service;

import com.tictacpro.model.Player;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;

@Service
public class AchievementService {

    private record Achievement(String id, Predicate<Player> condition) {}

    private final List<Achievement> ACHIEVEMENTS = List.of(
        new Achievement("first_win",    p -> p.getWins() >= 1),
        new Achievement("hat_trick",    p -> p.getCurrentStreak() >= 3),
        new Achievement("win_streak_5", p -> p.getCurrentStreak() >= 5),
        new Achievement("win_streak_10",p -> p.getCurrentStreak() >= 10),
        new Achievement("veteran",      p -> p.getGamesPlayed() >= 100),
        new Achievement("draw_master",  p -> p.getDrawCount() >= 10),
        new Achievement("rating_1300",  p -> p.getRating() >= 1300),
        new Achievement("rating_1500",  p -> p.getRating() >= 1500),
        new Achievement("rating_1800",  p -> p.getRating() >= 1800),
        new Achievement("ai_slayer",    p -> p.getAiHardWins() >= 1),
        new Achievement("ai_streak",    p -> p.getAiHardStreak() >= 5),
        new Achievement("corner_master",p -> p.getCornerWins() >= 5),
        new Achievement("speed_demon",  p -> p.isWonIn5())
    );

    public List<String> process(Player player) {
        List<String> current = new ArrayList<>(player.getAchievements());
        List<String> unlocked = new ArrayList<>();

        for (Achievement a : ACHIEVEMENTS) {
            if (!current.contains(a.id()) && a.condition().test(player)) {
                current.add(a.id());
                unlocked.add(a.id());
            }
        }

        player.setAchievements(current);
        return unlocked;
    }
}
