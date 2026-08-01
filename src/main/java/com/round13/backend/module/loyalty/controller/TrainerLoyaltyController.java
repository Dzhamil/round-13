package com.round13.backend.module.loyalty.controller;

import com.round13.backend.module.loyalty.dto.LoyaltyPointHistoryItemResponse;
import com.round13.backend.module.loyalty.dto.ManualPointAwardRequest;
import com.round13.backend.module.loyalty.service.LoyaltyAccrualService;
import com.round13.backend.module.loyalty.service.LoyaltyQueryService;
import com.round13.backend.security.AuthenticationUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trainer/students/{studentId}/loyalty")
@RequiredArgsConstructor
public class TrainerLoyaltyController {

    private final LoyaltyAccrualService accrualService;
    private final LoyaltyQueryService queryService;

    @PostMapping("/points/manual")
    public LoyaltyPointHistoryItemResponse awardManual(
            Authentication authentication,
            @PathVariable UUID studentId,
            @Valid @RequestBody ManualPointAwardRequest request
    ) {
        ManualPointAwardRequest normalized = new ManualPointAwardRequest(
                studentId,
                request.sourceType(),
                request.ruleCode(),
                request.pointsDelta(),
                request.eventDate(),
                request.sourceEntityId(),
                request.sourceEntityType(),
                request.reason(),
                request.metadata()
        );
        return queryService.toHistoryItem(accrualService.awardManual(AuthenticationUtils.getUserId(authentication), normalized));
    }

    @GetMapping("/history")
    public List<LoyaltyPointHistoryItemResponse> history(
            @PathVariable UUID studentId,
            @RequestParam(required = false) Integer limit
    ) {
        return queryService.history(studentId, limit, null);
    }
}
