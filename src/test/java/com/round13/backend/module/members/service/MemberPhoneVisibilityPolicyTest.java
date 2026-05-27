package com.round13.backend.module.members.service;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class MemberPhoneVisibilityPolicyTest {

    private static final String PHONE = "+79990001122";

    private final MemberPhoneVisibilityPolicy policy = new MemberPhoneVisibilityPolicy();

    @Test
    void resolveReturnsPhoneForSelfWhenPhoneIsNotHidden() {
        UUID userId = UUID.randomUUID();

        var visibility = policy.resolve(userId, PHONE, false, userId);

        assertThat(visibility.phone()).isEqualTo(PHONE);
        assertThat(visibility.hidden()).isFalse();
    }

    @Test
    void resolveHidesPhoneForOtherViewer() {
        UUID subjectId = UUID.randomUUID();
        UUID viewerId = UUID.randomUUID();

        var visibility = policy.resolve(subjectId, PHONE, false, viewerId);

        assertThat(visibility.phone()).isNull();
        assertThat(visibility.hidden()).isTrue();
    }

    @Test
    void resolveHidesPhoneForAnonymousViewer() {
        UUID subjectId = UUID.randomUUID();

        var visibility = policy.resolve(subjectId, PHONE, false, null);

        assertThat(visibility.phone()).isNull();
        assertThat(visibility.hidden()).isTrue();
    }

    @Test
    void resolveTreatsPhoneHiddenAsStricterThanSelfVisibility() {
        UUID userId = UUID.randomUUID();

        var visibility = policy.resolve(userId, PHONE, true, userId);

        assertThat(visibility.phone()).isNull();
        assertThat(visibility.hidden()).isTrue();
    }

    @Test
    void resolveDoesNotMarkMissingPhoneAsPolicyHiddenByDefault() {
        UUID subjectId = UUID.randomUUID();
        UUID viewerId = UUID.randomUUID();

        var visibility = policy.resolve(subjectId, null, false, viewerId);

        assertThat(visibility.phone()).isNull();
        assertThat(visibility.hidden()).isFalse();
    }
}
