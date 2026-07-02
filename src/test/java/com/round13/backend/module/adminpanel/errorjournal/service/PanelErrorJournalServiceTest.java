package com.round13.backend.module.adminpanel.errorjournal.service;

import com.round13.backend.domain.CriticalErrorEventEntity;
import com.round13.backend.domain.CriticalErrorSeverity;
import com.round13.backend.domain.CriticalErrorSource;
import com.round13.backend.domain.CriticalErrorStatus;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.module.adminpanel.errorjournal.repo.CriticalErrorEventRepository;
import com.round13.backend.module.adminpanel.errorjournal.sanitize.ErrorJournalSanitizer;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PanelErrorJournalServiceTest {

    private final CriticalErrorEventRepository repository = mock(CriticalErrorEventRepository.class);
    private final PanelErrorJournalService service = new PanelErrorJournalService(repository, new ErrorJournalSanitizer());

    @Test
    void updateStatusSetsResolutionFields() {
        UUID eventId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        CriticalErrorEventEntity event = event(eventId);
        when(repository.findById(eventId)).thenReturn(Optional.of(event));
        when(repository.save(event)).thenReturn(event);

        var response = service.updateStatus(eventId, CriticalErrorStatus.RESOLVED, " fixed token=abc ", adminId);

        assertThat(response.status()).isEqualTo(CriticalErrorStatus.RESOLVED);
        assertThat(response.resolvedByUserId()).isEqualTo(adminId);
        assertThat(response.resolvedAt()).isNotNull();
        assertThat(response.resolutionNote()).isEqualTo("fixed token=[redacted]");
        verify(repository).save(event);
    }

    @Test
    void updateStatusOpenClearsResolutionFields() {
        UUID eventId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        CriticalErrorEventEntity event = event(eventId);
        event.setStatus(CriticalErrorStatus.RESOLVED);
        event.setResolvedAt(OffsetDateTime.now());
        event.setResolvedByUserId(adminId);
        event.setResolutionNote("done");
        when(repository.findById(eventId)).thenReturn(Optional.of(event));
        when(repository.save(event)).thenReturn(event);

        var response = service.updateStatus(eventId, CriticalErrorStatus.OPEN, "ignored", adminId);

        assertThat(response.status()).isEqualTo(CriticalErrorStatus.OPEN);
        assertThat(response.resolvedByUserId()).isNull();
        assertThat(response.resolvedAt()).isNull();
        assertThat(response.resolutionNote()).isNull();
    }

    @Test
    void detailNotFoundUsesBusinessException() {
        UUID eventId = UUID.randomUUID();
        when(repository.findById(eventId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.detail(eventId)).isInstanceOf(BusinessException.class);
    }

    private CriticalErrorEventEntity event(UUID id) {
        CriticalErrorEventEntity event = new CriticalErrorEventEntity();
        event.setId(id);
        event.setOccurredAt(OffsetDateTime.now());
        event.setCreatedAt(OffsetDateTime.now());
        event.setSeverity(CriticalErrorSeverity.ERROR);
        event.setSource(CriticalErrorSource.BACKEND);
        event.setStatus(CriticalErrorStatus.OPEN);
        event.setFingerprint("abc123");
        return event;
    }
}
