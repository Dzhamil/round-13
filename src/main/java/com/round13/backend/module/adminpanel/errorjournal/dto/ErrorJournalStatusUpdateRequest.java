package com.round13.backend.module.adminpanel.errorjournal.dto;

import com.round13.backend.domain.CriticalErrorStatus;
import jakarta.validation.constraints.NotNull;

public record ErrorJournalStatusUpdateRequest(
        @NotNull CriticalErrorStatus status,
        String note
) {
}
