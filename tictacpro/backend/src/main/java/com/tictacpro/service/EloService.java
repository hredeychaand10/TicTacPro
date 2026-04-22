package com.tictacpro.service;

import org.springframework.stereotype.Service;

@Service
public class EloService {

    private static final int K_NEW        = 32;
    private static final int K_ESTABLISHED = 16;
    private static final int ESTABLISHED_GAMES = 30;

    public static class EloResult {
        public final int newA, deltaA, newB, deltaB;
        public EloResult(int newA, int deltaA, int newB, int deltaB) {
            this.newA = newA; this.deltaA = deltaA;
            this.newB = newB; this.deltaB = deltaB;
        }
    }

    private double expectedScore(int rA, int rB) {
        return 1.0 / (1 + Math.pow(10, (rB - rA) / 400.0));
    }

    private int kFactor(int gamesPlayed) {
        return gamesPlayed < ESTABLISHED_GAMES ? K_NEW : K_ESTABLISHED;
    }

    public EloResult calculate(int rA, int rB, double scoreA, int gA, int gB) {
        double exp = expectedScore(rA, rB);
        int dA = (int) Math.round(kFactor(gA) * (scoreA - exp));
        int dB = (int) Math.round(kFactor(gB) * ((1 - scoreA) - (1 - exp)));
        return new EloResult(Math.max(100, rA + dA), dA, Math.max(100, rB + dB), dB);
    }
}
