package com.round13.backend.module.loyalty.controller;

import com.round13.backend.module.loyalty.dto.LoyaltyPointHistoryItemResponse;
import com.round13.backend.module.loyalty.dto.ManualPointAwardRequest;
import com.round13.backend.module.loyalty.dto.PointCorrectionRequest;
import com.round13.backend.module.loyalty.dto.PointRevokeRequest;
import com.round13.backend.module.loyalty.service.LoyaltyAccrualService;
import com.round13.backend.module.loyalty.service.LoyaltyQueryService;
import com.round13.backend.security.AuthenticationUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/loyalty")
@RequiredArgsConstructor
public class AdminLoyaltyController {

    private final LoyaltyAccrualService accrualService;
    private final LoyaltyQueryService queryService;

    @PostMapping("/points/manual")
    public LoyaltyPointHistoryItemResponse awardManual(
            Authentication authentication,
            @Valid @RequestBody ManualPointAwardRequest request
    ) {
        return queryService.toHistoryItem(accrualService.awardManual(AuthenticationUtils.getUserId(authentication), request));
    }

    @PostMapping("/points/{entryId}/corrections")
    public LoyaltyPointHistoryItemResponse correct(
            Authentication authentication,
            @PathVariable UUID entryId,
            @Valid @RequestBody PointCorrectionRequest request
    ) {
        UUID actorId = AuthenticationUtils.getUserId(authentication);
        return queryService.toHistoryItem(accrualService.correct(actorId, entryId, request));
    }

    @PostMapping("/points/{entryId}/revoke")
    public LoyaltyPointHistoryItemResponse revoke(
            Authentication authentication,
            @PathVariable UUID entryId,
            @Valid @RequestBody PointRevokeRequest request
    ) {
        UUID actorId = AuthenticationUtils.getUserId(authentication);
        return queryService.toHistoryItem(accrualService.revoke(actorId, entryId, request));
    }

    @GetMapping("/members/{memberId}/history")
    public List<LoyaltyPointHistoryItemResponse> history(
            @PathVariable UUID memberId,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime before
    ) {
        return queryService.history(memberId, limit, before);
    }
}
