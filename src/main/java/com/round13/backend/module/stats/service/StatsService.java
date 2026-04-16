package com.round13.backend.module.stats.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.stats.dto.MyStatsResponse;
import com.round13.backend.module.training.service.TrainingParticipationService;
import com.round13.backend.module.user.dto.UserProfileBundle;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StatsService {

    private static final Integer RATING_PLACE_NOT_AVAILABLE = null;

    private final UserRepository userRepository;
    private final TrainingParticipationService trainingParticipationService;

    @Transactional
    public MyStatsResponse getMyStats(UUID userId) {
        requireUserId(userId);

        UserProfileBundle bundle = userRepository.findUserProfileBundle(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        UserStatsEntity stats = trainingParticipationService.syncParticipationStats(bundle.user());
        return buildResponse(bundle.profile(), stats);
    }

    private void requireUserId(UUID userId) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
    }

    private MyStatsResponse buildResponse(ProfileEntity profile, UserStatsEntity stats) {
        int wins = nonNegative(stats.getWinsCount());
        int defeats = nonNegative(stats.getDefeatsCount());
        int fights = nonNegative(stats.getFightsCount());
        int knockouts = nonNegative(stats.getKnockoutsCount());
        int knockdowns = nonNegative(stats.getKnockdownsCount());
        int trainingsAttended = nonNegative(stats.getTrainingsAttendedCount());
        int trainingsMissed = nonNegative(stats.getTrainingsMissedCount());
        int sparrings = resolveSparrings(fights, wins, defeats);

        return new MyStatsResponse(
                RATING_PLACE_NOT_AVAILABLE,
                calculateClubExperienceMonths(profile),
                fights,
                wins,
                defeats,
                sparrings,
                trainingsAttended,
                trainingsMissed,
                calculatePercent(wins, wins + defeats),
                calculatePercent(knockouts, sparrings),
                calculatePercent(knockdowns, sparrings)
        );
    }

    private int calculateClubExperienceMonths(ProfileEntity profile) {
        if (profile == null || profile.getDebutDate() == null) {
            return 0;
        }

        LocalDate debut = profile.getDebutDate();
        LocalDate today = LocalDate.now();
        if (debut.isAfter(today)) {
            return 0;
        }

        Period period = Period.between(debut, today);
        return period.getYears() * 12 + period.getMonths();
    }

    private int resolveSparrings(int fights, int wins, int defeats) {
        return fights > 0 ? fights : wins + defeats;
    }

    private int nonNegative(int value) {
        return Math.max(value, 0);
    }

    private int calculatePercent(int value, int total) {
        if (total <= 0) {
            return 0;
        }
        return (int) Math.round((value * 100.0) / total);
    }
}
