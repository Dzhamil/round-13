package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.RoleEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.adminpanel.controller.dto.PanelCreateUserRequest;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.RoleRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PanelManualUserServiceTest {

    private final UserRepository users = mock(UserRepository.class);
    private final RoleRepository roles = mock(RoleRepository.class);
    private final ProfileRepository profiles = mock(ProfileRepository.class);
    private final PasswordEncoder encoder = mock(PasswordEncoder.class);
    private final PanelManualUserService service = new PanelManualUserService(
            users, roles, profiles, encoder, new RussianPhoneNormalizer()
    );

    @Test
    void createsCoachWithGeneratedPasswordAndNormalizesRussianPhone() {
        RoleEntity coach = new RoleEntity();
        coach.setCode("COACH");
        UUID userId = UUID.randomUUID();
        when(roles.findByCode("COACH")).thenReturn(Optional.of(coach));
        when(encoder.encode(any())).thenReturn("encoded-password");
        when(users.save(any())).thenAnswer(invocation -> {
            UserEntity user = invocation.getArgument(0);
            user.setId(userId);
            return user;
        });

        var response = service.create(request("89600563067", "musakas"));

        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.issuedPassword()).hasSize(14);
        verify(users).save(org.mockito.ArgumentMatchers.argThat(user ->
                user.getPhone().equals("+79600563067")
                        && user.getRole() == coach
                        && user.getStatus() == UserStatus.ACTIVE
                        && user.getPasswordHash().equals("encoded-password")
        ));
        verify(profiles).save(org.mockito.ArgumentMatchers.argThat(profile ->
                profile.getFullName().equals("Лёнин Владимир Олегович")
                        && profile.getUser().getId().equals(userId)
        ));
    }

    @Test
    void rejectsDuplicateNormalizedPhoneWithSpecificError() {
        when(users.existsByPhone("+79600563067")).thenReturn(true);

        assertThatThrownBy(() -> service.create(request("8 (960) 056-30-67", "other")))
                .isInstanceOfSatisfying(BusinessException.class, exception ->
                        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.PHONE_EXISTS));
    }

    private PanelCreateUserRequest request(String phone, String nickname) {
        return new PanelCreateUserRequest(
                "Лёнин", "Владимир", "Олегович", phone, nickname, null, true, "COACH"
        );
    }
}
