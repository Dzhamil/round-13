package com.round13.backend.module.info.controller;

import com.round13.backend.module.info.dto.ClubEventResponse;
import com.round13.backend.module.info.service.ClubEventService;
import com.round13.backend.security.AuthenticationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Account Club Events", description = "Мои события клуба")
@RestController
@RequestMapping("/api/account/events")
@RequiredArgsConstructor
public class AccountClubEventController {

    private final ClubEventService clubEventService;

    @Operation(summary = "Получить мои события клуба")
    @GetMapping
    public List<ClubEventResponse> myEvents(Authentication authentication) {
        return clubEventService.getMyEvents(AuthenticationUtils.getUserId(authentication));
    }
}
