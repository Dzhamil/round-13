package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.*;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.module.adminpanel.repo.DeletedUserDataRepository;
import com.round13.backend.module.auth.service.RefreshTokenService;
import com.round13.backend.module.user.repo.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class PanelUserLifecycleServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final RoleRepository roles = mock(RoleRepository.class);
    private final RefreshTokenService tokens = mock(RefreshTokenService.class);
    private final DeletedUserDataRepository data = mock(DeletedUserDataRepository.class);
    private final PanelUserLifecycleService service = new PanelUserLifecycleService(users, roles, tokens, data);
    private final UUID actor = UUID.randomUUID();

    @ParameterizedTest
    @EnumSource(value = UserStatus.class, names = {"ACTIVE", "PROFILE_INCOMPLETE", "DELETED"})
    void blockRevokesSessionsAndUnblockRestoresOriginalStatus(UserStatus status) {
        UserEntity user = user(status);
        service.block(actor, user.getId());
        service.block(actor, user.getId());
        assertThat(user.isBlocked()).isTrue();
        verify(tokens, times(2)).revokeAllByUserId(user.getId());
        service.unblock(actor, user.getId());
        assertThat(user.getStatus()).isEqualTo(status);
        assertThat(user.getStatusBeforeBlock()).isNull();
    }

    @Test
    void deletionReleasesIdentityRemovesPermissionsAndCannotReactivate() {
        UserEntity user = user(UserStatus.ACTIVE);
        user.setPhone("+79991234567");
        user.setNickname("old_nick");
        user.setTelegramUserId(123L);
        user.setPasswordHash("secret");
        user.setTrainer(true);
        RoleEntity athlete = new RoleEntity();
        athlete.setCode("ATHLETE");
        when(roles.findByCode("ATHLETE")).thenReturn(Optional.of(athlete));

        service.delete(actor, user.getId());
        user.reactivate();

        assertThat(user.isDeleted()).isTrue();
        assertThat(user.isPermanentlyDeleted()).isTrue();
        assertThat(user.getDeletedAt()).isNotNull();
        assertThat(user.getTelegramUserId()).isNull();
        assertThat(user.getPhone()).isNull();
        assertThat(user.getNickname()).isNull();
        assertThat(user.getPasswordHash()).isNull();
        assertThat(user.isTrainer()).isFalse();
        assertThat(user.getRole()).isSameAs(athlete);
        verify(data).removeOwnedData(user.getId(), "+79991234567");
        assertThatThrownBy(() -> service.unblock(actor, user.getId())).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> service.block(actor, user.getId())).isInstanceOf(BusinessException.class);
    }

    private UserEntity user(UserStatus status) {
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setStatus(status);
        when(users.findByIdForUpdate(user.getId())).thenReturn(Optional.of(user));
        return user;
    }
}
