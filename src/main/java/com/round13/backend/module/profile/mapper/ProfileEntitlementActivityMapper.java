package com.round13.backend.module.profile.mapper;

import com.round13.backend.domain.TrainingBalanceEventType;
import com.round13.backend.domain.UserEntitlementEventType;
import com.round13.backend.module.profile.dto.ProfileEntitlementActivityResponse;
import com.round13.backend.module.profile.dto.ProfileGroupEntitlementActivityRow;
import com.round13.backend.module.profile.dto.ProfilePersonalEntitlementActivityRow;
import org.springframework.stereotype.Component;

@Component
public class ProfileEntitlementActivityMapper {

    private static final String PERSONAL_TRAININGS_CREDIT_TITLE = "Начислены персональные тренировки";
    private static final String PERSONAL_TRAININGS_ATTENDED_TITLE = "Списана персональная тренировка";
    private static final String PERSONAL_TRAININGS_NO_SHOW_TITLE = "Списание за неявку";
    private static final String PERSONAL_TRAININGS_LATE_CANCEL_TITLE = "Списание за позднюю отмену";
    private static final String PERSONAL_TRAININGS_MANUAL_DEBIT_TITLE = "Ручное списание персональной тренировки";
    private static final String TRAINER_SUBTITLE_TEMPLATE = "Тренер: %s";
    private static final String UNKNOWN_TRAINER_LABEL = "Не назначен";
    private static final String GROUP_PACKAGE_ACTIVATED_TITLE = "Активирован групповой пакет";
    private static final String GROUP_PACKAGE_RESERVED_TITLE = "Запись на групповую тренировку";
    private static final String GROUP_PACKAGE_REFUNDED_TITLE = "Возврат в групповой пакет";
    private static final String DEFAULT_GROUP_PACKAGE_TITLE = "Пакет групповых тренировок";

    public ProfileEntitlementActivityResponse fromPersonalRow(ProfilePersonalEntitlementActivityRow row) {
        return new ProfileEntitlementActivityResponse(
                row.id() == null ? null : row.id().toString(),
                resolvePersonalTitle(row.eventType()),
                TRAINER_SUBTITLE_TEMPLATE.formatted(resolveTrainerLabel(row.trainerName())),
                row.delta(),
                row.balanceAfter(),
                row.createdAt()
        );
    }

    public ProfileEntitlementActivityResponse fromGroupRow(ProfileGroupEntitlementActivityRow row) {
        return new ProfileEntitlementActivityResponse(
                row.id() == null ? null : row.id().toString(),
                resolveGroupTitle(row.eventType()),
                resolveGroupSubtitle(row),
                row.delta(),
                row.balanceAfter(),
                row.createdAt()
        );
    }

    private String resolvePersonalTitle(TrainingBalanceEventType eventType) {
        if (eventType == null) {
            return PERSONAL_TRAININGS_CREDIT_TITLE;
        }

        return switch (eventType) {
            case MANUAL_ADD -> PERSONAL_TRAININGS_CREDIT_TITLE;
            case ATTENDED_DEBIT -> PERSONAL_TRAININGS_ATTENDED_TITLE;
            case NO_SHOW_DEBIT -> PERSONAL_TRAININGS_NO_SHOW_TITLE;
            case LATE_CANCEL_DEBIT -> PERSONAL_TRAININGS_LATE_CANCEL_TITLE;
            case MANUAL_DEBIT -> PERSONAL_TRAININGS_MANUAL_DEBIT_TITLE;
        };
    }

    private String resolveTrainerLabel(String trainerName) {
        if (trainerName == null || trainerName.isBlank()) {
            return UNKNOWN_TRAINER_LABEL;
        }
        return trainerName.trim();
    }

    private String resolveGroupTitle(UserEntitlementEventType eventType) {
        if (eventType == null) {
            return GROUP_PACKAGE_ACTIVATED_TITLE;
        }

        return switch (eventType) {
            case ACTIVATED -> GROUP_PACKAGE_ACTIVATED_TITLE;
            case RESERVED_FOR_EVENT -> GROUP_PACKAGE_RESERVED_TITLE;
            case REFUNDED -> GROUP_PACKAGE_REFUNDED_TITLE;
        };
    }

    private String resolveGroupSubtitle(ProfileGroupEntitlementActivityRow row) {
        if (row.clubEventTitle() != null && !row.clubEventTitle().isBlank()) {
            return row.clubEventTitle().trim();
        }
        if (row.packageTitle() != null && !row.packageTitle().isBlank()) {
            return row.packageTitle().trim();
        }
        return DEFAULT_GROUP_PACKAGE_TITLE;
    }
}
