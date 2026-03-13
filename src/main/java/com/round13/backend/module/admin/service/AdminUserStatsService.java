package com.round13.backend.module.admin.service;

import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.admin.dto.AdminUpdateStatsRequest;
import com.round13.backend.module.admin.mapper.AdminUserStatsMapper;
import com.round13.backend.module.members.repo.UserStatsCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Сервис для администраторов и тренеров
 * для редактирования статистики пользователей.
 * Маппинг DTO → Entity делается через AdminUserStatsMapper.
 */
@Service
@RequiredArgsConstructor
public class AdminUserStatsService {

    private final UserStatsCacheRepository statsRepository;
    private final AdminUserStatsMapper statsMapper;

    /**
     * Обновляет статистику пользователя по данным администратора/тренера.
     */
    @Transactional
    public UserStatsEntity updateStats(AdminUpdateStatsRequest request) {
        UUID userId = request.getUserId();

        UserStatsEntity stats = statsRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        statsMapper.updateFromDto(request, stats);

        return statsRepository.save(stats);
    }
}
