package com.round13.backend.module.members.controller;

import com.round13.backend.module.members.service.TrainerStudentsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/trainer/students")
@RequiredArgsConstructor
public class TrainerStudentsController {

    private final TrainerStudentsService service;

    @PostMapping("/{studentId}")
    public void addStudent(
            Authentication authentication,
            @PathVariable UUID studentId
    ) {
        UUID trainerId = UUID.fromString(authentication.getName());
        service.addStudent(trainerId, studentId);
    }

    @DeleteMapping("/{studentId}")
    public void removeStudent(
            Authentication authentication,
            @PathVariable UUID studentId
    ) {
        UUID trainerId = UUID.fromString(authentication.getName());
        service.removeStudent(trainerId, studentId);
    }

}