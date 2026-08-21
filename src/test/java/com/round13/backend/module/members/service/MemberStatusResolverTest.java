package com.round13.backend.module.members.service;

import com.round13.backend.module.members.config.MemberStatusProperties;
import com.round13.backend.module.user.UserRoleCodes;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MemberStatusResolverTest {

    @Test
    void coachRoleDoesNotProduceTrainerSpecificStatusLabel() {
        MemberStatusResolver resolver = new MemberStatusResolver(new MemberStatusProperties());

        assertThat(resolver.resolve(0, UserRoleCodes.COACH)).isEqualTo("Новичок");
    }
}
