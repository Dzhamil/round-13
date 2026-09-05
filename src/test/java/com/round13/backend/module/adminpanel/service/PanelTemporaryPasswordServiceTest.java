package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PanelTemporaryPasswordServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final PasswordEncoder encoder = mock(PasswordEncoder.class);
    private final TemporaryPasswordGenerator generator = mock(TemporaryPasswordGenerator.class);
    private final PanelTemporaryPasswordService service =
            new PanelTemporaryPasswordService(users, encoder, generator);

    @Test
    void replacesPasswordHashAndReturnsPlaintextOnlyInResponse() {
        UUID panelAdminId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserEntity user = new UserEntity();
        user.setId(userId);
        user.setPasswordHash("old-hash");
        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(generator.generate()).thenReturn("New-temporary1!");
        when(encoder.encode("New-temporary1!")).thenReturn("new-hash");

        var response = service.reset(panelAdminId, userId);

        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.issuedPassword()).isEqualTo("New-temporary1!");
        assertThat(user.getPasswordHash()).isEqualTo("new-hash");
        verify(users).save(user);
    }

    @Test
    void rejectsResetForUnknownUserWithoutGeneratingPassword() {
        UUID userId = UUID.randomUUID();
        when(users.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.reset(UUID.randomUUID(), userId))
                .isInstanceOfSatisfying(BusinessException.class, exception ->
                        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_FOUND));
        verify(generator, never()).generate();
        verify(users, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
