package com.round13.backend.module.profile.service;

import com.round13.backend.support.ProfileIdentityFixture;
import com.round13.backend.domain.*;
import com.round13.backend.module.profile.dto.UpdateProfileRequest;
import com.round13.backend.module.profile.mapper.ProfileMapper;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import java.util.Optional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileCompletionTest {
    private final UserRepository users = mock(UserRepository.class);
    private final ProfileRepository profiles = mock(ProfileRepository.class);
    private final ProfileService service = new ProfileService(users, profiles,
            Mappers.getMapper(ProfileMapper.class), new ProfileServiceUtil(), mock(ProfileEntitlementService.class));

    private final org.springframework.context.ApplicationEventPublisher events = mock(org.springframework.context.ApplicationEventPublisher.class);
    private final ProfileCommandService commands = new ProfileCommandService(events, users, profiles,
            Mappers.getMapper(ProfileMapper.class), new ProfileServiceUtil(), mock(ProfileEntitlementService.class));

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
        commands.updateMyProfile(user.getId(), request(ProfileIdentityFixture.paddedNameParts()));
        assertThat(profile.isProfileCompleted()).isTrue();
        verify(events).publishEvent(new ProfileSaved(user.getId()));
        verify(users, atLeastOnce()).save(user);
        verify(profiles).save(profile);
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
        commands.updateMyProfile(user.getId(), request(new String[]{null, null, null}));
        assertThat(profile.isProfileCompleted()).isFalse();
        assertThat(user.getStatus()).isEqualTo(UserStatus.PROFILE_INCOMPLETE);
    }

    @Test
    void updateAndReadExposeVerificationWithoutUsingStaffVerificationOrAccountStatus() throws Exception {
        UserEntity user = user();
        user.setStatus(UserStatus.ACTIVE);
        user.setPhoneVerifiedByStaff(true);
        ProfileEntity profile = profile(user);
        profile.setProfileCompleted(true);
        var initial = service.getMe(user.getId());
        assertThat(initial.isProfileVerificationRequired()).isTrue();
        assertThat(initial.getProfileMissingFields()).containsExactly("surname", "firstName", "patronymic");
        var saved = commands.updateMyProfile(user.getId(), request(ProfileIdentityFixture.nameParts()));
        assertThat(saved.isProfileVerificationRequired()).isFalse();
        assertThat(saved.getProfileMissingFields()).isEmpty();
        assertThat(service.getMe(user.getId()).isProfileVerificationRequired()).isFalse();
        var json = new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules().valueToTree(saved);
        assertThat(json.get("profileVerificationRequired").asBoolean()).isFalse();
        assertThat(user.isPhoneVerifiedByStaff()).isTrue();

        profile.setBirthDate(null);
        assertThat(service.getMe(user.getId()).getProfileMissingFields()).containsExactly("birthDate");
        assertThat(profile.isProfileCompleted()).isTrue();
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    void completingBlockedAccountDoesNotActivateIt() {
        UserEntity user = user();
        user.setStatus(UserStatus.BLOCKED);
        profile(user);
        assertThat(commands.updateMyProfile(user.getId(), request(ProfileIdentityFixture.nameParts()))
                .isProfileVerificationRequired()).isFalse();
        assertThat(user.getStatus()).isEqualTo(UserStatus.BLOCKED);
    }

    @Test
    void completionWithoutBirthdayRemainsIncomplete() {
        UserEntity user = user();
        profile(user).setBirthDate(null);
        var result = commands.updateMyProfile(user.getId(), request(ProfileIdentityFixture.nameParts()));
        assertThat(result.isProfileVerificationRequired()).isTrue();
        assertThat(result.getProfileMissingFields()).containsExactly("birthDate");
        assertThat(user.getStatus()).isEqualTo(UserStatus.PROFILE_INCOMPLETE);
    }

    @Test
    void readNeverNormalizesSavesOrActivatesEvenWhenComplete() {
        UserEntity user = user();
        ProfileEntity profile = profile(user);
        profile.setSurname("  Ivanov  ");
        profile.setFirstName("Ivan");
        profile.setPatronymic("Ivanovich");
        assertThat(service.getMe(user.getId()).isProfileCompleted()).isTrue();
        assertThat(profile.getSurname()).isEqualTo("  Ivanov  ");
        assertThat(profile.isProfileCompleted()).isFalse();
        assertThat(user.getStatus()).isEqualTo(UserStatus.PROFILE_INCOMPLETE);
        verify(users, never()).save(any());
        verify(profiles, never()).save(any());
    }

    @Test
    void missingLegacyProfileIsReportedWithoutCreatingOne() {
        UserEntity user = user();
        var me = service.getMe(user.getId());
        assertThat(me.isProfileVerificationRequired()).isTrue();
        assertThat(me.getProfileMissingFields()).contains("surname", "avatarUrl");
        verify(profiles, never()).save(any());
        verify(users, never()).save(any());
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
        profile.setBirthDate(java.time.LocalDate.of(2000, 1, 1));
        profile.setAvatarUrl("avatar.jpg");
        when(profiles.findByUserId(user.getId())).thenReturn(Optional.of(profile));
        return profile;
    }

    private UpdateProfileRequest request(String[] parts) {
        return new UpdateProfileRequest(parts[0], parts[1], parts[2], null, null, null,
                null, null, null, null, null, null, null);
    }
}
