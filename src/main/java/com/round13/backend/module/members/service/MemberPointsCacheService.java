// src/main/java/com/round13/backend/module/members/service/MemberPointsCacheService.java
package com.round13.backend.module.members.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.module.user.dto.UserProfileBundle;
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
    private final UserStatsFactory userStatsFactory;

    @Transactional
    public void recalcAll() {
        recalcUsers(userRepository.findAllWithRole());
    }

    @Transactional
    public void recalcForUser(UUID userId) {
        if (userId == null) return;

        userRepository.findByIdWithRole(userId)
                .ifPresent(user -> recalcUsers(List.of(user)));
    }

    @Transactional
    public void recalcForUsers(List<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) return;

        List<UserEntity> users = userRepository.findAllById(userIds).stream()
                .filter(user -> user.getRole() != null)
                .toList();

        recalcUsers(users);
    }

    /** Reuse the profiles already loaded for member-list names. */
    @Transactional
    public Map<UUID, UserStatsEntity> recalcForUsers(List<UUID> userIds, Map<UUID, ProfileEntity> profiles) {
        if (userIds.isEmpty()) return Map.of();
        List<UserEntity> users = userRepository.findAllById(userIds).stream()
                .filter(user -> user.getRole() != null).toList();
        Map<UUID, UserStatsEntity> stats = loadOrCreateStatsByUserId(users);
        applyCacheUpdates(users, stats, profiles);
        if (!stats.isEmpty()) userStatsCacheRepository.saveAll(stats.values());
        return stats;
    }

    /** Refresh the already loaded detail bundle without loading user/profile/stats again. */
    @Transactional
    public UserProfileBundle recalcBundle(UserProfileBundle bundle) {
        UserStatsEntity stats = bundle.stats() == null ? userStatsFactory.createEmpty(bundle.user()) : bundle.stats();
        Map<UUID, ProfileEntity> profiles = new HashMap<>();
        if (bundle.profile() != null) profiles.put(bundle.user().getId(), bundle.profile());
        applyCacheUpdates(List.of(bundle.user()), Map.of(bundle.user().getId(), stats), profiles);
        userStatsCacheRepository.saveAll(List.of(stats));
        return new UserProfileBundle(bundle.user(), bundle.profile(), stats);
    }

    private void recalcUsers(List<UserEntity> users) {
        if (users.isEmpty()) return;

        List<UUID> userIds = users.stream().map(UserEntity::getId).toList();
        Map<UUID, UserStatsEntity> statsByUserId = loadOrCreateStatsByUserId(users);
        Map<UUID, ProfileEntity> profilesByUserId = loadProfilesByUserId(userIds);

        applyCacheUpdates(users, statsByUserId, profilesByUserId);

        userStatsCacheRepository.saveAll(statsByUserId.values());
    }

    private Map<UUID, UserStatsEntity> loadOrCreateStatsByUserId(List<UserEntity> users) {
        List<UUID> userIds = users.stream().map(UserEntity::getId).toList();

        Map<UUID, UserStatsEntity> map = new HashMap<>();
        userStatsCacheRepository.findAllById(userIds).forEach(stats -> map.put(stats.getUserId(), stats));

        for (UserEntity user : users) {
            map.computeIfAbsent(user.getId(), ignored -> userStatsFactory.createEmpty(user));
        }

        return map;
    }

    private Map<UUID, ProfileEntity> loadProfilesByUserId(List<UUID> userIds) {
        Map<UUID, ProfileEntity> map = new HashMap<>();
        profileRepository.findByUserIdIn(userIds).forEach(p -> map.put(p.getUser().getId(), p));
        return map;
    }

    private void applyCacheUpdates(
            List<UserEntity> users,
            Map<UUID, UserStatsEntity> statsByUserId,
            Map<UUID, ProfileEntity> profilesByUserId
    ) {
        LocalDate today = LocalDate.now();

        for (UserEntity user : users) {
            UUID userId = user.getId();
            UserStatsEntity stats = statsByUserId.get(userId);
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
