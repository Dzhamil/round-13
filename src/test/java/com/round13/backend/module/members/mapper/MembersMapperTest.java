package com.round13.backend.module.members.mapper;

import com.round13.backend.module.members.dto.MemberListItemRow;
import com.round13.backend.module.members.service.MemberPhoneVisibilityPolicy;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class MembersMapperTest {

    private static final String PHONE = "+79990001122";

    private final MembersMapper mapper = Mappers.getMapper(MembersMapper.class);
    private final MemberPhoneVisibilityPolicy policy = new MemberPhoneVisibilityPolicy();

    @Test
    void toListItemKeepsSelfPhoneVisible() {
        UUID userId = UUID.randomUUID();
        MemberListItemRow row = row(userId, false);

        var response = mapper.toListItem(row, policy.resolve(row.id(), row.phone(), row.phoneHidden(), userId));

        assertThat(response.getPhone()).isEqualTo(PHONE);
        assertThat(response.isPhoneHidden()).isFalse();
    }

    @Test
    void toListItemReturnsHiddenStateForOtherMemberPhone() {
        UUID viewerId = UUID.randomUUID();
        MemberListItemRow row = row(UUID.randomUUID(), false);

        var response = mapper.toListItem(row, policy.resolve(row.id(), row.phone(), row.phoneHidden(), viewerId));

        assertThat(response.getPhone()).isNull();
        assertThat(response.isPhoneHidden()).isTrue();
    }

    @Test
    void toListItemKeepsMissingPhoneDifferentFromHiddenPhone() {
        UUID viewerId = UUID.randomUUID();
        MemberListItemRow row = new MemberListItemRow(
                UUID.randomUUID(),
                "fighter",
                null,
                false,
                null,
                0,
                "Newcomer",
                "ATHLETE"
        );

        var response = mapper.toListItem(row, policy.resolve(row.id(), row.phone(), row.phoneHidden(), viewerId));

        assertThat(response.getPhone()).isNull();
        assertThat(response.isPhoneHidden()).isFalse();
    }

    private MemberListItemRow row(UUID userId, boolean phoneHidden) {
        return new MemberListItemRow(
                userId,
                "fighter",
                PHONE,
                phoneHidden,
                null,
                12,
                "Newcomer",
                "ATHLETE"
        );
    }
}
