package com.round13.backend.module.sheets.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TrainerSheetImportScheduler {
    private final GoogleSheetSyncService sync;

    @Scheduled(cron = "0 */30 * * * *", zone = "Europe/Moscow")
    public void synchronize() {
        try {
            var result = sync.syncActive();
            long errors = result.imports().stream().filter(item -> item.status().equals("ERROR")).count();
            log.info("Trainer Sheets sync finished: trainers={}, errors={}", result.trainersRead(), errors);
            result.imports().stream().filter(item -> item.status().equals("ERROR")).forEach(item ->
                    log.warn("Trainer Sheets import failed: trainer={}, sheet={}, error={}", item.trainer(), item.sheet(), item.error()));
        } catch (RuntimeException ex) {
            log.error("Scheduled Trainer Sheets sync failed; next run remains scheduled", ex);
        }
    }
}
