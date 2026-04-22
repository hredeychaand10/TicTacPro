package com.tictacpro.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

@Controller
public class AppController {

    @GetMapping("/api/health")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "ts", System.currentTimeMillis()));
    }

    @GetMapping(value = { "/", "/home", "/lobby", "/game", "/dashboard" })
    public String spa() {
        return "forward:/index.html";
    }
}
