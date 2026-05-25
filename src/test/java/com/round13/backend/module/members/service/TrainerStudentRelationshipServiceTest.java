package com.round13.backend.module.members.service;

import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringJUnitConfig(TrainerStudentRelationshipServiceTest.Config.class)
class TrainerStudentRelationshipServiceTest {

    @Autowired
    private TrainerStudentRelationshipService service;

    @Autowired
    private UserTrainerLinkRepository userTrainerLinkRepository;

    @AfterEach
    void resetMocks() {
        reset(userTrainerLinkRepository);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminRemovesSelectedRelationshipByLinkIdOnly() {
        UUID adminId = UUID.randomUUID();
        UUID selectedLinkId = UUID.randomUUID();
        UUID selectedTrainerId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        UserTrainerLinkEntity selectedLink = link(selectedLinkId, selectedTrainerId, studentId);

        when(userTrainerLinkRepository.findById(selectedLinkId)).thenReturn(Optional.of(selectedLink));

        service.removeAsAdmin(adminId, selectedLinkId);

        verify(userTrainerLinkRepository).findById(selectedLinkId);
        verify(userTrainerLinkRepository).delete(selectedLink);
        verify(userTrainerLinkRepository, never()).deleteByTrainerIdAndStudentId(any(), any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminRemoveRejectsMissingRelationshipWithoutDeletingAnything() {
        UUID adminId = UUID.randomUUID();
        UUID missingLinkId = UUID.randomUUID();
        when(userTrainerLinkRepository.findById(missingLinkId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.removeAsAdmin(adminId, missingLinkId))
                .isInstanceOfSatisfying(BusinessException.class, ex ->
                        assertThat(((BusinessException) ex).getErrorCode()).isEqualTo(ErrorCode.USER_NOT_FOUND));

        verify(userTrainerLinkRepository, never()).deleteByTrainerIdAndStudentId(any(), any());
        verify(userTrainerLinkRepository, never()).delete(any(UserTrainerLinkEntity.class));
    }

    @Test
    @WithMockUser(roles = "COACH")
    void coachRemovesOnlyOwnTrainerStudentPair() {
        UUID trainerId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        service.removeOwnStudent(trainerId, studentId);

        verify(userTrainerLinkRepository).deleteByTrainerIdAndStudentId(trainerId, studentId);
    }

    @Test
    @WithMockUser(roles = "COACH")
    void coachCannotUseAdminRelationshipRemoval() {
        assertThatThrownBy(() -> service.removeAsAdmin(UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithAnonymousUser
    void anonymousUserCannotRemoveOwnStudentRelationship() {
        assertThatThrownBy(() -> service.removeOwnStudent(UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(AccessDeniedException.class);
    }

    private static UserTrainerLinkEntity link(UUID id, UUID trainerId, UUID studentId) {
        UserTrainerLinkEntity link = new UserTrainerLinkEntity();
        link.setId(id);
        link.setTrainerId(trainerId);
        link.setStudentId(studentId);
        return link;
    }

    @Configuration(proxyBeanMethods = false)
    @EnableMethodSecurity
    static class Config {

        @Bean
        UserTrainerLinkRepository userTrainerLinkRepository() {
            return mock(UserTrainerLinkRepository.class);
        }

        @Bean
        TrainerStudentRelationshipService trainerStudentRelationshipService(
                UserTrainerLinkRepository userTrainerLinkRepository
        ) {
            return new TrainerStudentRelationshipService(userTrainerLinkRepository);
        }
    }
}
