package com.round13.backend.module.info.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.info.mapper.ClubEventMapper;
import com.round13.backend.module.info.repo.*;
import com.round13.backend.module.shop.service.GroupTrainingEntitlementService;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ClubEventBatchTest {
    final ClubEventRepository events = mock(ClubEventRepository.class);
    final ClubEventParticipantRepository participants = mock(ClubEventParticipantRepository.class);
    final GroupTrainingEntitlementService entitlements = mock(GroupTrainingEntitlementService.class);
    final ClubEventService service = new ClubEventService(events, participants, Mappers.getMapper(ClubEventMapper.class), mock(UserRepository.class), entitlements);

    @Test void allListsResolveBalanceOnlyOnceAndSkipAnonymousAndOrdinaryEvents() {
        UUID user = UUID.randomUUID(); var rows = new ArrayList<ClubEventEntity>();
        for (int i = 0; i < 100; i++) { var event = new ClubEventEntity(); event.setId(UUID.randomUUID());
            event.setType(i == 0 ? "OTHER" : "COACH_TRAINING"); rows.add(event); }
        when(events.findUpcoming(any())).thenReturn(rows); when(events.findHistory(any(), any())).thenReturn(rows);
        when(participants.findMyEvents(eq(user), any())).thenReturn(rows.stream().map(e -> {
            var p = new ClubEventParticipantEntity(); p.setEvent(e); return p; }).toList());
        when(entitlements.getRemainingGroupTrainings(user)).thenReturn(7);
        for (var result : List.of(service.getUpcoming(user), service.getHistory(user), service.getMyEvents(user))) {
            assertThat(result).extracting(r -> r.getId()).containsExactlyElementsOf(rows.stream().map(ClubEventEntity::getId).toList());
            assertThat(result.getFirst().getRemainingGroupTrainings()).isNull();
            assertThat(result.subList(1, result.size())).allSatisfy(r -> assertThat(r.getRemainingGroupTrainings()).isEqualTo(7));
        }
        verify(entitlements, times(3)).getRemainingGroupTrainings(user); clearInvocations(entitlements);
        service.getUpcoming(null); service.getHistory(null);
        when(events.findUpcoming(any())).thenReturn(List.of(rows.getFirst())); service.getUpcoming(user);
        verifyNoInteractions(entitlements);
    }
}
