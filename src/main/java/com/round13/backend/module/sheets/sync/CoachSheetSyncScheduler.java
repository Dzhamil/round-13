package com.round13.backend.module.sheets.sync;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CoachSheetSyncScheduler {
    private final CoachSheetSyncService sync;

    @Scheduled(initialDelayString = "${app.sheets.coaches-sync-delay-ms:60000}",
            fixedDelayString = "${app.sheets.coaches-sync-delay-ms:60000}")
    public void reconcile() {
        try {
            sync.syncActive();
        } catch (RuntimeException ex) {
            // No identity values or credential-bearing gateway responses in routine logs.
            log.warn("Coach sheet reconciliation failed ({}); pending changes retained for retry", ex.getClass().getSimpleName());
        }
    }
}
