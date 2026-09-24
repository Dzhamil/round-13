package com.round13.backend.module.stats.service;

import com.round13.backend.domain.AttendanceStatus;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.members.repo.UserStatsCacheRepository;
import com.round13.backend.module.members.service.MemberPointsCacheService;
import com.round13.backend.module.members.service.UserStatsFactory;
import com.round13.backend.module.stats.repo.TrainingAttendanceStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class TrainingAttendanceStatsService {

    private final TrainingAttendanceStatsRepository participantRepository;
    private final UserStatsCacheRepository userStatsCacheRepository;
    private final UserStatsFactory userStatsFactory;
    private final MemberPointsCacheService memberPointsCacheService;

    public UserStatsEntity syncParticipationStats(UserEntity user) {
        if (user == null || user.getId() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        OffsetDateTime now = OffsetDateTime.now();
        int attendedCount = (int) participantRepository.countCompleted(
                user.getId(),
                AttendanceStatus.PRESENT, now
        );
        int missedCount = (int) participantRepository.countCompleted(user.getId(), AttendanceStatus.ABSENT, now);

        UserStatsEntity stats = userStatsCacheRepository.findById(user.getId())
                .orElseGet(() -> userStatsFactory.createEmpty(user));
        stats.setUser(user);

        if (stats.getTrainingsAttendedCount() != attendedCount
                || stats.getTrainingsMissedCount() != missedCount
                || stats.getCreatedAt() == null) {
            stats.setTrainingsAttendedCount(attendedCount);
            stats.setTrainingsMissedCount(missedCount);
            stats = userStatsCacheRepository.save(stats);
        }

        memberPointsCacheService.recalcForUser(user.getId());
        return stats;
    }
}
