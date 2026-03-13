package com.round13.backend.module.user.mapper;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.module.user.dto.UserProfileResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.LocalDate;
import java.time.Period;

/**
 * MapStruct-маппер публичного профиля участника.
 *
 * ВАЖНО (откат рейтинга):
 * - не используем module.rating.* (его больше нет)
 * - ratingPlace всегда null
 * - winRatePercent считаем локально по wins/defeats
 * - sparringsCount берём как fightsCount (если есть), иначе wins+defeats
 * - clubExperienceMonths считаем по profile.debutDate
 */
@Mapper(componentModel = "spring")
public interface UserProfileResponseMapper {

    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "nickname", source = "user.nickname")
    @Mapping(target = "fullName", source = "profile.fullName")
    @Mapping(target = "avatarUrl", source = "profile.avatarUrl")
    @Mapping(target = "gender", source = "profile.gender")

    @Mapping(target = "clubExperienceMonths", source = "profile", qualifiedByName = "clubExperienceMonths")

    // Рейтинг откатан: место в рейтинге больше не считаем
    @Mapping(target = "ratingPlace", expression = "java(null)")

    @Mapping(target = "winRatePercent", source = "stats", qualifiedByName = "winRatePercentOrNull")

    @Mapping(target = "winsCount", source = "stats.winsCount")
    @Mapping(target = "defeatsCount", source = "stats.defeatsCount")

    @Mapping(target = "sparringsCount", source = "stats", qualifiedByName = "sparringsCountOrZero")
    @Mapping(target = "trainingsAttendedCount", source = "stats.trainingsAttendedCount")
    UserProfileResponse toResponse(UserEntity user, ProfileEntity profile, UserStatsEntity stats);

    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "nickname", source = "user.nickname")
    @Mapping(target = "fullName", source = "profile.fullName")
    @Mapping(target = "avatarUrl", source = "profile.avatarUrl")
    @Mapping(target = "gender", source = "profile.gender")
    @Mapping(target = "clubExperienceMonths", source = "profile", qualifiedByName = "clubExperienceMonths")
    @Mapping(target = "ratingPlace", expression = "java(null)")
    @Mapping(target = "winRatePercent", expression = "java(null)")
    @Mapping(target = "winsCount", expression = "java(0)")
    @Mapping(target = "defeatsCount", expression = "java(0)")
    @Mapping(target = "sparringsCount", expression = "java(0)")
    @Mapping(target = "trainingsAttendedCount", expression = "java(0)")
    UserProfileResponse toResponseWithoutStats(UserEntity user, ProfileEntity profile);

    @Named("clubExperienceMonths")
    default int clubExperienceMonths(ProfileEntity profile) {
        if (profile == null) return 0;

        LocalDate debut = profile.getDebutDate();
        if (debut == null) return 0;

        LocalDate today = LocalDate.now();
        if (debut.isAfter(today)) return 0;

        Period p = Period.between(debut, today);
        return p.getYears() * 12 + p.getMonths();
    }

    @Named("winRatePercentOrNull")
    default Integer winRatePercentOrNull(UserStatsEntity stats) {
        if (stats == null) return null;

        int wins = Math.max(stats.getWinsCount(), 0);
        int defeats = Math.max(stats.getDefeatsCount(), 0);

        int total = wins + defeats;
        if (total <= 0) return 0;

        // округляем до целого процента
        return (int) Math.round((wins * 100.0) / total);
    }

    @Named("sparringsCountOrZero")
    default int sparringsCountOrZero(UserStatsEntity stats) {
        if (stats == null) return 0;

        int fights = Math.max(stats.getFightsCount(), 0);
        if (fights > 0) return fights;

        int wins = Math.max(stats.getWinsCount(), 0);
        int defeats = Math.max(stats.getDefeatsCount(), 0);
        return wins + defeats;
    }
}
