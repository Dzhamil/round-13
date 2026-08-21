package com.round13.backend.module.loyalty.controller;

import com.round13.backend.module.loyalty.dto.LoyaltyLeaderboardResponse;
import com.round13.backend.module.loyalty.service.LoyaltyQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
public class LoyaltyLeaderboardController {

    private final LoyaltyQueryService queryService;

    @GetMapping("/leaderboard")
    public LoyaltyLeaderboardResponse leaderboard(@RequestParam(required = false) Integer limit) {
        return queryService.leaderboard(limit);
    }
}
