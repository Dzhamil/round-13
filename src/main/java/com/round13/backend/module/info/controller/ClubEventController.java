package com.round13.backend.module.info.controller;

import com.round13.backend.module.info.dto.ClubEventResponse;
import com.round13.backend.module.info.service.ClubEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Club Events", description = "События клуба")
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class ClubEventController {

    private final ClubEventService clubEventService;

    @Operation(summary = "Получить список предстоящих событий клуба")
    @GetMapping
    public List<ClubEventResponse> getUpcoming() {
        return clubEventService.getUpcoming();
    }
}
