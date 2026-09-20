package com.round13.backend.module.members.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.members.dto.MemberListItemRow;
import com.round13.backend.module.members.dto.MembersGroup;
import com.round13.backend.module.members.mapper.MembersMapper;
import com.round13.backend.module.members.repo.MembersReadRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import java.util.List;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class MembersProfileNamesTest {
    @Test
    void listsPreferProfileNamesKeepNicknameSeparateAndBatchProfilesWithoutExposingHiddenPhone() {
        var profiles = mock(ProfileRepository.class);
        var rows = mock(MembersReadRepository.class);
        var visibility = mock(MemberPhoneVisibilityPolicy.class);
        var service = new MembersService(profiles, rows, Mappers.getMapper(MembersMapper.class),
                mock(MemberPointsCacheService.class), visibility);
        var named = UUID.randomUUID();
        var unnamed = UUID.randomUUID();
        when(rows.findCoaches()).thenReturn(List.of(
                new MemberListItemRow(named, "nickname", "hidden-phone", true, null, 0, "—", "COACH"),
                new MemberListItemRow(unnamed, null, "hidden-phone", true, null, 0, "—", "COACH")));
        var profile = new ProfileEntity(); var user = new UserEntity(); user.setId(named); profile.setUser(user);
        profile.setSurname("Surname"); profile.setFirstName("First"); profile.setFullName("Legacy");
        when(profiles.findByUserIdIn(any())).thenReturn(List.of(profile));
        var result = service.getMembers(MembersGroup.COACHES, UUID.randomUUID()).getItems();
        assertThat(result.getFirst().getDisplayName()).isEqualTo("Surname First");
        assertThat(result.getFirst().getNickname()).isEqualTo("nickname");
        assertThat(result.get(1).getDisplayName()).isEqualTo("Без имени");
        assertThat(result.get(1).getPhone()).isNull();
        verify(profiles).findByUserIdIn(argThat(ids -> ids.size() == 2 && ids.containsAll(List.of(named, unnamed))));
        verifyNoMoreInteractions(profiles);
    }
}
