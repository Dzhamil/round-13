package com.round13.backend.module.members.mapper;

import com.round13.backend.module.members.dto.MemberListItemResponse;
import com.round13.backend.module.members.dto.MemberListItemRow;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class MembersMapperTest {

    private final MembersMapper mapper = new MembersMapper() {
    };

    @Test
    void toListItemReturnsPhoneWhenVisible() {
        UUID id = UUID.randomUUID();
        MemberListItemResponse response = mapper.toListItem(
                new MemberListItemRow(id, "fighter", "+79991234567", false, null, 10, "Новичок", "ATHLETE")
        );

        assertThat(response.getId()).isEqualTo(id.toString());
        assertThat(response.getPhone()).isEqualTo("+79991234567");
        assertThat(response.isPhoneHidden()).isFalse();
    }

    @Test
    void toListItemHidesPhoneWhenRequested() {
        UUID id = UUID.randomUUID();
        MemberListItemResponse response = mapper.toListItem(
                new MemberListItemRow(id, "fighter", "+79991234567", true, null, 10, "Новичок", "ATHLETE")
        );

        assertThat(response.getPhone()).isNull();
        assertThat(response.isPhoneHidden()).isTrue();
    }
}
