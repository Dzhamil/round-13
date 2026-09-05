package com.round13.backend.module.verification.controller;

import com.round13.backend.module.verification.dto.VerificationDtos.*;
import com.round13.backend.module.verification.service.StudentVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
public class StudentVerificationController {
    private final StudentVerificationService service;
    @GetMapping("/trainers") public List<TrainerOption> trainers() { return service.trainers(); }
    @GetMapping("/mine") public List<RequestResponse> mine(Authentication auth) { return service.mine(id(auth)); }
    @PostMapping public List<RequestResponse> submit(Authentication auth, @Valid @RequestBody SubmitRequest request) {
        return service.submit(id(auth), request);
    }
    @GetMapping("/incoming") public List<RequestResponse> incoming(Authentication auth) { return service.incoming(id(auth)); }
    @PostMapping("/{requestId}/review") public RequestResponse review(Authentication auth, @PathVariable UUID requestId,
            @RequestBody ReviewRequest request) { return service.review(id(auth), requestId, request); }
    private UUID id(Authentication auth) { return UUID.fromString(auth.getName()); }
}
