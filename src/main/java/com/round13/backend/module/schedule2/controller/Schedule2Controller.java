package com.round13.backend.module.schedule2.controller;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.schedule2.dto.Schedule2Dtos.TrainingSummary;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/** Empty read boundary until Schedule 2.0 has its own storage model. */
@RestController
@RequestMapping("/api/schedule2")
public class Schedule2Controller {
    @GetMapping("/trainings")
    public List<TrainingSummary> list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (to.isBefore(from)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        return List.of();
    }
}
