package com.round13.backend.module.profile.service;

import com.round13.backend.support.ProfileIdentityFixture;
import com.round13.backend.domain.*;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.module.profile.dto.UpdateProfileRequest;
import com.round13.backend.module.profile.mapper.ProfileMapper;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mapstruct.factory.Mappers;
import java.util.Optional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileCompletionTest {
    private final UserRepository users = mock(UserRepository.class);
    private final ProfileRepository profiles = mock(ProfileRepository.class);
    private final com.round13.backend.module.sheets.sync.CoachSheetChanges changes = mock(com.round13.backend.module.sheets.sync.CoachSheetChanges.class);
    private final ProfileService service = new ProfileService(users, profiles,
            Mappers.getMapper(ProfileMapper.class), new ProfileServiceUtil(), mock(ProfileEntitlementService.class), changes);

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t\n"})
    void completionRejectsEveryMissingPartBeforeSaving(String missing) {
        for (int index = 0; index < 3; index++) {
            String[] parts = ProfileIdentityFixture.nameParts();
            parts[index] = missing;
            assertThatThrownBy(() -> service.completeProfile(UUID.randomUUID(), request(parts)))
                    .isInstanceOf(BusinessException.class);
            verifyNoInteractions(users, profiles);
        }
    }

    @Test
    void partialUpdateValidationAllowsOmittedFieldsButRejectsBlankNameParts() {
        try (var factory = jakarta.validation.Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            assertThat(validator.validate(request(new String[]{null, null, null}))).isEmpty();
            for (int index = 0; index < 3; index++) {
                String[] parts = {null, null, null};
                parts[index] = " \t";
                assertThat(validator.validate(request(parts))).hasSize(1);
            }
        }
    }

    @Test
    void completeProfileNormalizesNamesAndActivatesUser() {
        UserEntity user = user();
        ProfileEntity profile = profile(user);
        service.completeProfile(user.getId(), request(ProfileIdentityFixture.paddedNameParts()));
        assertThat(profile.isProfileCompleted()).isTrue();
        assertThat(profile.getSurname()).isEqualTo(ProfileIdentityFixture.SURNAME);
        assertThat(profile.getFirstName()).isEqualTo(ProfileIdentityFixture.FIRST_NAME);
        assertThat(profile.getPatronymic()).isEqualTo(ProfileIdentityFixture.PATRONYMIC);
        assertThat(profile.getFullName()).isEqualTo(ProfileIdentityFixture.FULL_NAME);
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    void readRecalculatesStaleCompletedFlagAndUpdateCannotCompleteLegacyOnlyProfile() {
        UserEntity user = user();
        ProfileEntity profile = profile(user);
        profile.setProfileCompleted(true);
        profile.setFullName("Legacy Name");
        assertThat(service.getMe(user.getId()).isProfileCompleted()).isFalse();
        service.updateMyProfile(user.getId(), request(new String[]{null, null, null}));
        assertThat(profile.isProfileCompleted()).isFalse();
        assertThat(user.getStatus()).isEqualTo(UserStatus.PROFILE_INCOMPLETE);
    }

    @Test
    void coachProfileChangeRecordsPreviousPhoneForDurableSheetIdentity() {
        var user = user(); var role = new RoleEntity(); role.setCode("COACH"); user.setRole(role);
        profile(user);
        var update = new UpdateProfileRequest("Новая", "Анна", "Ивановна", "new-nick", "+79997654321", null,
                null, null, null, null, null, null, null);
        service.updateMyProfile(user.getId(), update);
        verify(changes).record(user, "+79991234567");
        assertThat(user.getPhone()).isEqualTo("+79997654321");
        assertThat(user.getNickname()).isEqualTo("new-nick");
    }

    private UserEntity user() {
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setStatus(UserStatus.PROFILE_INCOMPLETE);
        user.setNickname("boxer");
        user.setPhone("+79991234567");
        when(users.findByIdWithRole(user.getId())).thenReturn(Optional.of(user));
        return user;
    }

    private ProfileEntity profile(UserEntity user) {
        ProfileEntity profile = new ProfileEntity();
        profile.setUser(user);
        profile.setGender("MALE");
        profile.setAvatarUrl("avatar.jpg");
        when(profiles.findByUserId(user.getId())).thenReturn(Optional.of(profile));
        return profile;
    }

    private UpdateProfileRequest request(String[] parts) {
        return new UpdateProfileRequest(parts[0], parts[1], parts[2], null, null, null,
                null, null, null, null, null, null, null);
    }
}
