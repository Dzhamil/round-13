// src/main/java/com/round13/backend/module/members/service/TrainerStudentsService.java
package com.round13.backend.module.members.service;

import com.round13.backend.domain.TrainingBalanceEventEntity;
import com.round13.backend.domain.TrainingBalanceEventType;
import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.members.repo.TrainingBalanceEventRepository;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Сервис управления связями «тренер → ученик».
 *
 * <p>Добавление ученика теперь проверяет, что ученик не является
 * тренером или администратором и что тренер не пытается добавить
 * самого себя. При нарушении правил бросается BusinessException с
 * кодом {@link ErrorCode#INVALID_REQUEST}. Если связь уже существует,
 * метод просто завершается без изменений.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TrainerStudentsService {

    private final UserTrainerLinkRepository repo;
    private final TrainingBalanceEventRepository trainingBalanceEventRepository;
    private final UserRepository userRepository;

    /**
     * Добавить ученика тренеру. Если ученик уже существует в списке либо
     * является тренером/админом, операция будет отклонена.
     *
     * @param trainerId идентификатор тренера
     * @param studentId идентификатор потенциального ученика
     */
    public void addStudent(UUID trainerId, UUID studentId) {
        // нельзя добавить себя
        if (trainerId.equals(studentId)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        // уже существует
        if (repo.existsByTrainerIdAndStudentId(trainerId, studentId)) {
            return;
        }

        // получаем только роль
        String roleCode = userRepository.findRoleCode(studentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // нельзя добавлять тренеров
        if ("COACH".equals(roleCode) || "ADMIN".equals(roleCode)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        UserTrainerLinkEntity link = new UserTrainerLinkEntity();
        link.setTrainerId(trainerId);
        link.setStudentId(studentId);

        repo.save(link);
    }

    /**
     * Удалить ученика из списка тренера.
     *
     * @param trainerId идентификатор тренера
     * @param studentId идентификатор ученика
     */
    public void removeStudent(UUID trainerId, UUID studentId) {
        repo.deleteByTrainerIdAndStudentId(trainerId, studentId);
    }

    /**
     * Обновить остаток тренировок для ученика тренера.
     *
     * @param trainerId идентификатор тренера
     * @param studentId идентификатор ученика
     * @param remainingTrainings новый остаток тренировок
     */
    public void updateRemainingTrainings(UUID trainerId, UUID studentId, Integer remainingTrainings) {
        if (remainingTrainings == null || remainingTrainings < 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        UserTrainerLinkEntity link = repo.findByTrainerIdAndStudentId(trainerId, studentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REQUEST));

        int currentBalance = link.getRemainingTrainings();
        int delta = remainingTrainings - currentBalance;
        if (delta == 0) {
            return;
        }

        link.setRemainingTrainings(remainingTrainings);
        repo.save(link);

        TrainingBalanceEventEntity event = new TrainingBalanceEventEntity();
        event.setTrainerId(trainerId);
        event.setStudentId(studentId);
        event.setDelta(delta);
        event.setBalanceAfter(remainingTrainings);
        event.setEventType(delta > 0 ? TrainingBalanceEventType.MANUAL_ADD : TrainingBalanceEventType.MANUAL_DEBIT);
        event.setCreatedByUserId(trainerId);
        trainingBalanceEventRepository.save(event);
    }
}
