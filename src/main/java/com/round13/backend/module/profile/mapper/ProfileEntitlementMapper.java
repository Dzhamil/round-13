package com.round13.backend.module.profile.mapper;

import com.round13.backend.domain.UserEntitlementType;
import com.round13.backend.domain.UserEntitlementEntity;
import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.module.profile.dto.ProfileEntitlementResponse;
import org.springframework.stereotype.Component;

@Component
public class ProfileEntitlementMapper {

    private static final String PERSONAL_PACKAGE_TITLE = "Персональный пакет тренировок";
    private static final String GROUP_PACKAGE_TITLE = "Пакет групповых тренировок";
    private static final String PERSONAL_SUBTITLE_TEMPLATE = "Тренер: %s";
    private static final String GROUP_SUBTITLE = "Групповые занятия клуба";
    private static final String PERSONAL_USAGE_HINT = "Списывается на персональной тренировке у выбранного тренера";
    private static final String GROUP_USAGE_HINT = "Списывается на групповых тренировках клуба";

    public ProfileEntitlementResponse toPersonalPackage(UserTrainerLinkEntity link, String trainerLabel) {
        return new ProfileEntitlementResponse(
                link.getId() == null ? null : link.getId().toString(),
                UserEntitlementType.PERSONAL_TRAININGS.name(),
                PERSONAL_PACKAGE_TITLE,
                PERSONAL_SUBTITLE_TEMPLATE.formatted(trainerLabel),
                PERSONAL_USAGE_HINT,
                link.getRemainingTrainings(),
                null
        );
    }

    public ProfileEntitlementResponse toGroupPackage(UserEntitlementEntity entity, String title, int remainingQuantity) {
        return new ProfileEntitlementResponse(
                entity.getId() == null ? null : entity.getId().toString(),
                UserEntitlementType.GROUP_TRAININGS.name(),
                title,
                GROUP_SUBTITLE,
                GROUP_USAGE_HINT,
                remainingQuantity,
                entity.getValidUntil()
        );
    }

    public String resolveGroupTitle(UserEntitlementEntity entity) {
        String note = entity.getNote();
        if (note == null || note.isBlank()) {
            return GROUP_PACKAGE_TITLE;
        }
        return note.trim();
    }
}
