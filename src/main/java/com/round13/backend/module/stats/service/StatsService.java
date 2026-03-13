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

    private final UserRepository userRepository;
    private final TrainingParticipationService trainingParticipationService;

    @Transactional
    public MyStatsResponse getMyStats(UUID userId) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        UserProfileBundle bundle = userRepository.findUserProfileBundle(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        UserStatsEntity stats = trainingParticipationService.syncParticipationStats(bundle.user());
        ProfileEntity profile = bundle.profile();

        int wins = Math.max(stats.getWinsCount(), 0);
        int defeats = Math.max(stats.getDefeatsCount(), 0);
        int fights = Math.max(stats.getFightsCount(), 0);
        int knockouts = Math.max(stats.getKnockoutsCount(), 0);
        int knockdowns = Math.max(stats.getKnockdownsCount(), 0);
        int trainingsAttended = Math.max(stats.getTrainingsAttendedCount(), 0);
        int trainingsMissed = Math.max(stats.getTrainingsMissedCount(), 0);
        int sparrings = fights > 0 ? fights : wins + defeats;

        return new MyStatsResponse(
                null,
                calcClubExperienceMonths(profile),
                fights,
                wins,
                defeats,
                sparrings,
                trainingsAttended,
                trainingsMissed,
                percent(wins, wins + defeats),
                percent(knockouts, sparrings),
                percent(knockdowns, sparrings)
        );
    }

    private int calcClubExperienceMonths(ProfileEntity profile) {
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

    private int percent(int value, int total) {
        if (total <= 0) {
            return 0;
        }
        return (int) Math.round((value * 100.0) / total);
    }
}
