// src/main/java/com/round13/backend/module/members/service/MemberPointsCacheService.java
package com.round13.backend.module.members.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.module.members.mapper.MemberPointsCacheMapper;
import com.round13.backend.module.members.repo.UserStatsCacheRepository;
import com.round13.backend.module.members.dto.MemberPointsCacheUpdate;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Оркестратор пересчёта кеша очков/статуса раз в сутки.
 */
@Service
@RequiredArgsConstructor
public class MemberPointsCacheService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final UserStatsCacheRepository userStatsCacheRepository;

    private final MemberPointsCalculator memberPointsCalculator;
    private final MemberStatusResolver memberStatusResolver;
    private final MemberPointsCacheMapper memberPointsCacheMapper;

    @Transactional
    public void recalcAll() {
        List<UserStatsEntity> statsList = loadAllStats();
        if (statsList.isEmpty()) return;

        List<UUID> userIds = extractUserIds(statsList);

        Map<UUID, UserEntity> usersById = loadUsersById(userIds);
        Map<UUID, ProfileEntity> profilesByUserId = loadProfilesByUserId(userIds);

        applyCacheUpdates(statsList, usersById, profilesByUserId);

        userStatsCacheRepository.saveAll(statsList);
    }

    private List<UserStatsEntity> loadAllStats() {
        return userStatsCacheRepository.findAll();
    }

    private List<UUID> extractUserIds(List<UserStatsEntity> statsList) {
        return statsList.stream().map(UserStatsEntity::getUserId).toList();
    }

    private Map<UUID, UserEntity> loadUsersById(List<UUID> userIds) {
        Map<UUID, UserEntity> map = new HashMap<>();
        userRepository.findAllById(userIds).forEach(u -> map.put(u.getId(), u));
        return map;
    }

    private Map<UUID, ProfileEntity> loadProfilesByUserId(List<UUID> userIds) {
        Map<UUID, ProfileEntity> map = new HashMap<>();
        profileRepository.findByUserIdIn(userIds).forEach(p -> map.put(p.getUser().getId(), p));
        return map;
    }

    private void applyCacheUpdates(
            List<UserStatsEntity> statsList,
            Map<UUID, UserEntity> usersById,
            Map<UUID, ProfileEntity> profilesByUserId
    ) {
        LocalDate today = LocalDate.now();

        for (UserStatsEntity stats : statsList) {
            UUID userId = stats.getUserId();

            UserEntity user = usersById.get(userId);
            String roleCode = resolveRoleCodeOrNull(user);

            ProfileEntity profile = profilesByUserId.get(userId);
            LocalDate debutDate = (profile == null) ? null : profile.getDebutDate();

            int tenureMonths = memberPointsCalculator.calcTenureMonths(debutDate, today);
            int points = memberPointsCalculator.calcPoints(stats, tenureMonths);
            String statusLabel = memberStatusResolver.resolve(points, roleCode);

            memberPointsCacheMapper.apply(
                    new MemberPointsCacheUpdate(points, statusLabel),
                    stats
            );
        }
    }

    private String resolveRoleCodeOrNull(UserEntity user) {
        if (user == null || user.getRole() == null) return null;
        return user.getRole().getCode();
    }
}
