package com.round13.backend.module.members.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.members.config.MemberStatusProperties;
import com.round13.backend.module.members.dto.*;
import com.round13.backend.module.members.mapper.*;
import com.round13.backend.module.members.repo.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.dto.UserProfileBundle;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import java.time.LocalDate;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class MemberRefreshBatchTest {
    final UserRepository users = mock(UserRepository.class);
    final ProfileRepository profiles = mock(ProfileRepository.class);
    final UserStatsCacheRepository stats = mock(UserStatsCacheRepository.class);
    final MemberPointsCacheService cache = new MemberPointsCacheService(users, profiles, stats, new MemberPointsCalculator(),
            new MemberStatusResolver(new MemberStatusProperties()), Mappers.getMapper(MemberPointsCacheMapper.class), new UserStatsFactory());

    @Test void allListsRefreshPointsWithoutRepeatingListOrProfileReads() {
        var rowsRepo = mock(MembersReadRepository.class);
        var service = new MembersService(profiles, rowsRepo, Mappers.getMapper(MembersMapper.class), cache, mock(MemberPhoneVisibilityPolicy.class));
        var user = user(); var profile = new ProfileEntity(); profile.setUser(user); profile.setDebutDate(LocalDate.now().minusMonths(2));
        profile.setSurname("Last"); profile.setFirstName("First");
        var row = new MemberListItemRow(user.getId(), "nick", "secret", true, null, 999, "stale", "ATHLETE");
        when(rowsRepo.findFighters()).thenReturn(List.of(row)); when(rowsRepo.findStudentsByTrainerId(any())).thenReturn(List.of(row));
        when(rowsRepo.findStudentLinksForAdmin(any())).thenReturn(List.of(row)); when(users.findAllById(any())).thenReturn(List.of(user));
        when(profiles.findByUserIdIn(any())).thenReturn(List.of(profile));
        for (var result : List.of(service.getMembers(MembersGroup.FIGHTERS, null), service.getMyStudents(UUID.randomUUID()),
                service.getTrainerStudentLinksForAdmin(UUID.randomUUID()), service.getMembers(MembersGroup.FIGHTERS, null))) {
            assertThat(result.getItems()).singleElement().satisfies(item -> {
                assertThat(item.getPoints()).isEqualTo(4); assertThat(item.getStatusLabel()).isNotEqualTo("stale");
                assertThat(item.getDisplayName()).isEqualTo("Last First"); });
        }
        verify(rowsRepo, times(2)).findFighters(); verify(rowsRepo).findStudentsByTrainerId(any()); verify(rowsRepo).findStudentLinksForAdmin(any());
        verify(profiles, times(4)).findByUserIdIn(any()); verify(users, times(4)).findAllById(any()); verify(stats, times(4)).findAllById(any());
        verify(profiles, never()).findByUserId(any());
    }

    @Test void loadedDetailReusesBundleAndReflectsStatsRoleAndDebutEdits() {
        var user = user(); var profile = new ProfileEntity(); profile.setUser(user); profile.setDebutDate(LocalDate.now().minusMonths(1));
        var first = cache.recalcBundle(new UserProfileBundle(user, profile, null));
        assertThat(first.stats().getPoints()).isEqualTo(2);
        first.stats().setWinsCount(5); profile.setDebutDate(LocalDate.now().minusMonths(3)); user.getRole().setCode("COACH");
        var second = cache.recalcBundle(first);
        assertThat(second.stats().getPoints()).isEqualTo(11); assertThat(second.stats()).isSameAs(first.stats());
        profile.setDebutDate(LocalDate.now().plusDays(1));
        assertThat(cache.recalcBundle(second).stats().getPoints()).isEqualTo(5);
        verifyNoInteractions(users, profiles); verify(stats, never()).findAllById(any()); verify(stats, times(3)).saveAll(any());
    }

    UserEntity user() { var user = new UserEntity(); user.setId(UUID.randomUUID()); var role = new RoleEntity(); role.setCode("ATHLETE"); user.setRole(role); return user; }
}
