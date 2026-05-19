package com.round13.backend.module.members.service;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MemberPhoneVisibilityPolicy {

    public PhoneVisibility resolve(
            UUID subjectUserId,
            String rawPhone,
            boolean subjectPhoneHidden,
            UUID viewerUserId
    ) {
        boolean hasPhone = rawPhone != null && !rawPhone.isBlank();
        boolean selfView = viewerUserId != null && viewerUserId.equals(subjectUserId);

        if (!hasPhone) {
            return new PhoneVisibility(null, subjectPhoneHidden);
        }

        if (subjectPhoneHidden || !selfView) {
            return new PhoneVisibility(null, true);
        }

        return new PhoneVisibility(rawPhone, false);
    }

    public record PhoneVisibility(String phone, boolean hidden) {
    }
}
