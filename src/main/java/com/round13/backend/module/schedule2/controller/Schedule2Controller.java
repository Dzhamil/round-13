package com.round13.backend.module.schedule2.controller;

import com.round13.backend.module.schedule2.dto.Schedule2Dtos.*;
import com.round13.backend.module.schedule2.service.Schedule2Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/schedule2")
@RequiredArgsConstructor
public class Schedule2Controller {
    private final Schedule2Service service;
    @GetMapping("/trainings")
    public List<TrainingSummary> list(Authentication auth,
            @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.list(id(auth), from, to);
    }
    @GetMapping("/trainings/{trainingId}")
    public TrainingDetail detail(Authentication auth, @PathVariable UUID trainingId) { return service.detail(id(auth), trainingId); }
    @PostMapping("/trainings")
    public TrainingDetail create(Authentication auth, @Valid @RequestBody CreateTrainingRequest request) {
        return service.create(id(auth), request);
    }
    @PutMapping("/trainings/{trainingId}/attendance")
    public TrainingDetail attendance(Authentication auth, @PathVariable UUID trainingId,
            @Valid @RequestBody AttendanceRequest request) { return service.applyAttendance(id(auth), trainingId, request); }
    private UUID id(Authentication auth) { return UUID.fromString(auth.getName()); }
}
