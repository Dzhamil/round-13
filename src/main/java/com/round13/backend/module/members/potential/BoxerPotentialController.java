package com.round13.backend.module.members.potential;

import com.round13.backend.module.members.potential.dto.BoxerPotentialLeaderboardResponse;
import com.round13.backend.module.members.potential.dto.BoxerPotentialMeasurementRequest;
import com.round13.backend.module.members.potential.dto.BoxerPotentialMeasurementResponse;
import com.round13.backend.module.members.potential.dto.BoxerPotentialSummaryResponse;
import com.round13.backend.security.AuthenticationUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class BoxerPotentialController {

    private final BoxerPotentialService service;

    @PostMapping("/{memberId}/boxer-potential/measurements")
    @PreAuthorize("hasAnyRole('COACH','ADMIN')")
    public BoxerPotentialMeasurementResponse createMeasurement(
            @PathVariable UUID memberId,
            @Valid @RequestBody BoxerPotentialMeasurementRequest request,
            Authentication authentication
    ) {
        return service.createMeasurement(AuthenticationUtils.getUserId(authentication), memberId, request);
    }

    @PutMapping("/{memberId}/boxer-potential/measurements/{measurementId}")
    @PreAuthorize("hasAnyRole('COACH','ADMIN')")
    public BoxerPotentialMeasurementResponse updateMeasurement(
            @PathVariable UUID memberId,
            @PathVariable UUID measurementId,
            @Valid @RequestBody BoxerPotentialMeasurementRequest request,
            Authentication authentication
    ) {
        return service.updateMeasurement(AuthenticationUtils.getUserId(authentication), memberId, measurementId, request);
    }

    @GetMapping("/{memberId}/boxer-potential/measurements")
    public List<BoxerPotentialMeasurementResponse> getMeasurements(
            @PathVariable UUID memberId,
            @RequestParam(name = "limit", required = false, defaultValue = "50") int limit,
            Authentication authentication
    ) {
        return service.getMeasurements(AuthenticationUtils.getUserId(authentication), memberId, limit);
    }

    @GetMapping("/{memberId}/boxer-potential/latest")
    public BoxerPotentialMeasurementResponse getLatest(
            @PathVariable UUID memberId,
            Authentication authentication
    ) {
        return service.getLatest(AuthenticationUtils.getUserId(authentication), memberId);
    }

    @GetMapping("/{memberId}/boxer-potential/summary")
    public BoxerPotentialSummaryResponse getSummary(
            @PathVariable UUID memberId,
            Authentication authentication
    ) {
        return service.getSummary(AuthenticationUtils.getUserId(authentication), memberId);
    }

    @GetMapping("/boxer-potential/leaderboard")
    public BoxerPotentialLeaderboardResponse getLeaderboard(
            @RequestParam BoxerPotentialNormGroup normGroup,
            @RequestParam(name = "limit", required = false, defaultValue = "20") int limit,
            Authentication authentication
    ) {
        return service.getLeaderboard(AuthenticationUtils.getUserId(authentication), normGroup, limit);
    }
}
