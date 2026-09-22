package com.round13.backend.module.sheets.service;

import com.round13.backend.module.sheets.dto.GoogleSheetDtos;
import org.junit.jupiter.api.Test;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import java.time.LocalDateTime;
import java.util.List;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class TrainerSheetImportSchedulerTest {
    @Test void runsSameManualServiceEveryThirtyMinutesAndSurvivesFailures() throws Exception {
        var sync = mock(GoogleSheetSyncService.class);
        when(sync.syncActive()).thenThrow(new IllegalStateException("offline"))
                .thenReturn(new GoogleSheetDtos.SyncResponse(1, 0, 0, 0, List.of(), List.of(
                        new GoogleSheetDtos.TrainerImportResult("Coach", "Sheet", "ERROR", "row 5", 0, 0, 0, 0))));
        var scheduler = new TrainerSheetImportScheduler(sync);
        assertThatCode(scheduler::synchronize).doesNotThrowAnyException();
        assertThatCode(scheduler::synchronize).doesNotThrowAnyException();
        verify(sync, times(2)).syncActive();
        var annotation = TrainerSheetImportScheduler.class.getMethod("synchronize").getAnnotation(Scheduled.class);
        var cron = CronExpression.parse(annotation.cron());
        var date = LocalDateTime.of(2026, 9, 22, 10, 0);
        assertThat(cron.next(date)).isEqualTo(date.plusMinutes(30));
        assertThat(cron.next(date.plusMinutes(30))).isEqualTo(date.plusHours(1));
    }
}
