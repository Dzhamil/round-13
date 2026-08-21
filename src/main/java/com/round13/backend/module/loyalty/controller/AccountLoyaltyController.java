package com.round13.backend.module.loyalty.controller;

import com.round13.backend.module.loyalty.dto.LoyaltyPointHistoryItemResponse;
import com.round13.backend.module.loyalty.dto.LoyaltySummaryResponse;
import com.round13.backend.module.loyalty.service.LoyaltyQueryService;
import com.round13.backend.security.AuthenticationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/account/loyalty")
@RequiredArgsConstructor
public class AccountLoyaltyController {

    private final LoyaltyQueryService queryService;

    @GetMapping("/summary")
    public LoyaltySummaryResponse summary(Authentication authentication) {
        return queryService.summary(AuthenticationUtils.getUserId(authentication));
    }

    @GetMapping("/history")
    public List<LoyaltyPointHistoryItemResponse> history(
            Authentication authentication,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime before
    ) {
        UUID userId = AuthenticationUtils.getUserId(authentication);
        return queryService.history(userId, limit, before);
    }
}
