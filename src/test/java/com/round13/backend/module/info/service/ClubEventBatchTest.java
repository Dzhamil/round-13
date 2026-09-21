package com.round13.backend.module.info.service;

import com.round13.backend.domain.*;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.module.info.mapper.ClubEventMapper;
import com.round13.backend.module.info.repo.*;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ClubEventBatchTest {
    final ClubEventRepository events = mock(ClubEventRepository.class);
    final ClubEventParticipantRepository participants = mock(ClubEventParticipantRepository.class);
    final UserRepository users = mock(UserRepository.class);
    final ClubEventService service = new ClubEventService(events, participants, Mappers.getMapper(ClubEventMapper.class), users);

    @Test void ordinaryEventsStillResolveJoinedIdsInOneBatch() {
        UUID user = UUID.randomUUID(); var rows = new ArrayList<ClubEventEntity>();
        for (int i = 0; i < 100; i++) { var event = new ClubEventEntity(); event.setId(UUID.randomUUID());
            event.setType("COMPETITION"); rows.add(event); }
        when(events.findUpcoming(any())).thenReturn(rows);
        when(participants.findJoinedEventIds(eq(user), any())).thenReturn(List.of(rows.getFirst().getId()));
        var result = service.getUpcoming(user);
        assertThat(result).hasSize(100);
        assertThat(result.getFirst().isJoinedByMe()).isTrue();
        assertThat(result.getLast().isJoinedByMe()).isFalse();
        verify(participants).findJoinedEventIds(eq(user), argThat(ids -> ids.size() == 100));
    }

    @Test void legacyTrainingCannotBeJoinedOrCancelledThroughAfisha() {
        UUID userId = UUID.randomUUID(), eventId = UUID.randomUUID();
        var event = new ClubEventEntity(); event.setType("COACH_TRAINING");
        when(events.findById(eventId)).thenReturn(Optional.of(event));
        assertThatThrownBy(() -> service.join(userId, eventId)).isInstanceOf(BusinessException.class);
        var participation = new ClubEventParticipantEntity(); participation.setEvent(event);
        when(participants.findByEvent_IdAndUser_Id(eventId, userId)).thenReturn(Optional.of(participation));
        assertThatThrownBy(() -> service.cancel(userId, eventId)).isInstanceOf(BusinessException.class);
        verify(participants, never()).save(any());
        verify(participants, never()).delete(any());
        verifyNoInteractions(users);
    }

    @Test void nonTrainingEventParticipationRemainsAvailable() {
        UUID userId = UUID.randomUUID(), eventId = UUID.randomUUID();
        var event = new ClubEventEntity(); event.setType("COMPETITION");
        var user = new UserEntity(); user.setId(userId);
        when(events.findById(eventId)).thenReturn(Optional.of(event));
        when(users.findById(userId)).thenReturn(Optional.of(user));
        service.join(userId, eventId);
        verify(participants).save(argThat(p -> p.getEvent() == event && p.getUser() == user));
        var participation = new ClubEventParticipantEntity(); participation.setEvent(event);
        when(participants.findByEvent_IdAndUser_Id(eventId, userId)).thenReturn(Optional.of(participation));
        service.cancel(userId, eventId);
        verify(participants).delete(participation);
    }
}
