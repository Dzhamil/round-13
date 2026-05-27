package com.round13.backend.module.members.mapper;

import com.round13.backend.module.members.dto.MemberListItemResponse;
import com.round13.backend.module.members.dto.MemberListItemRow;
import com.round13.backend.module.members.service.MemberPhoneVisibilityPolicy;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class MembersMapperTest {

    private static final String PHONE = "+79990001122";

    private final MembersMapper mapper = new MembersMapper() {
    };
    private final MemberPhoneVisibilityPolicy policy = new MemberPhoneVisibilityPolicy();

    @Test
    void toListItemKeepsSelfPhoneVisible() {
        UUID userId = UUID.randomUUID();
        MemberListItemRow row = row(userId, false);

        MemberListItemResponse response = mapper.toListItem(
                row,
                policy.resolve(row.id(), row.phone(), row.phoneHidden(), userId)
        );

        assertThat(response.getId()).isEqualTo(userId.toString());
        assertThat(response.getPhone()).isEqualTo(PHONE);
        assertThat(response.isPhoneHidden()).isFalse();
    }

    @Test
    void toListItemReturnsHiddenStateForOtherMemberPhone() {
        UUID viewerId = UUID.randomUUID();
        MemberListItemRow row = row(UUID.randomUUID(), false);

        MemberListItemResponse response = mapper.toListItem(
                row,
                policy.resolve(row.id(), row.phone(), row.phoneHidden(), viewerId)
        );

        assertThat(response.getPhone()).isNull();
        assertThat(response.isPhoneHidden()).isTrue();
    }

    @Test
    void toListItemHidesPhoneWhenRequested() {
        UUID userId = UUID.randomUUID();
        MemberListItemRow row = row(userId, true);

        MemberListItemResponse response = mapper.toListItem(
                row,
                policy.resolve(row.id(), row.phone(), row.phoneHidden(), userId)
        );

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

        MemberListItemResponse response = mapper.toListItem(
                row,
                policy.resolve(row.id(), row.phone(), row.phoneHidden(), viewerId)
        );

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
