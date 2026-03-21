package com.round13.backend.module.info.controller;

import com.round13.backend.module.info.dto.ClubEventResponse;
import com.round13.backend.module.info.service.ClubEventService;
import com.round13.backend.security.AuthenticationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Club Events", description = "События клуба")
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class ClubEventController {

    private final ClubEventService clubEventService;

    @Operation(summary = "Получить список предстоящих событий клуба")
    @GetMapping
    public List<ClubEventResponse> getUpcoming(Authentication authentication) {
        return clubEventService.getUpcoming(AuthenticationUtils.getUserIdOrNull(authentication));
    }

    @Operation(summary = "Получить историю событий клуба")
    @GetMapping("/history")
    public List<ClubEventResponse> getHistory(Authentication authentication) {
        return clubEventService.getHistory(AuthenticationUtils.getUserIdOrNull(authentication));
    }

    @Operation(summary = "Принять участие в событии клуба")
    @PostMapping("/{id}/join")
    public void join(Authentication authentication, @PathVariable UUID id) {
        clubEventService.join(AuthenticationUtils.getUserId(authentication), id);
    }

    @Operation(summary = "Отменить участие в событии клуба")
    @PostMapping("/{id}/cancel")
    public void cancel(Authentication authentication, @PathVariable UUID id) {
        clubEventService.cancel(AuthenticationUtils.getUserId(authentication), id);
    }
}
