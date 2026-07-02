package com.round13.backend.module.adminpanel.errorjournal.dto;

import java.util.List;

public record ErrorJournalPageResponse(
        List<ErrorJournalListItemResponse> items,
        int page,
        int size,
        long totalItems,
        int totalPages
) {
}
