package com.round13.backend.module.admin.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.module.info.dto.CreateClubEventRequest;
import com.round13.backend.module.info.mapper.ClubEventMapper;
import com.round13.backend.module.info.repo.ClubEventRepository;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import java.time.OffsetDateTime;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class AdminClubEventServiceTest {
    @Test void adminCannotRecreateLegacyTrainingThroughClubEventApi() {
        var events = mock(ClubEventRepository.class);
        var users = mock(UserRepository.class);
        var mapper = mock(ClubEventMapper.class);
        var service = new AdminClubEventService(events, mapper, users);
        var request = new CreateClubEventRequest("Old training", null, "COACH_TRAINING",
                OffsetDateTime.now().plusDays(1), OffsetDateTime.now().plusDays(2), null);
        UUID admin = UUID.randomUUID(), event = UUID.randomUUID();
        assertThatThrownBy(() -> service.create(admin, request)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> service.update(admin, event, request)).isInstanceOf(BusinessException.class);
        verifyNoInteractions(events, users, mapper);
    }
}
