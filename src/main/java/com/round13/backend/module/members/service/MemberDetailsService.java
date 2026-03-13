// src/main/java/com/round13/backend/module/members/service/MemberDetailsService.java
package com.round13.backend.module.members.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.members.dto.MemberDetailsResponse;
import com.round13.backend.module.members.mapper.MemberDetailsMapper;
import com.round13.backend.module.members.repo.MembersTrainingSessionRepository;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.util.Optional;
import java.util.UUID;

/**
 * Сервис детальной карточки участника.
 */
@Service
@RequiredArgsConstructor
public class MemberDetailsService {

    private static final String ROLE_COACH = "COACH";
    private static final String ROLE_ADMIN = "ADMIN";

    private final UserRepository userRepository;
    private final MembersTrainingSessionRepository membersTrainingSessionRepository;
    private final UserTrainerLinkRepository userTrainerLinkRepository;
    private final MemberDetailsMapper memberDetailsMapper;
    private final MemberPointsCacheService memberPointsCacheService;

    /**
     * Получить детальную карточку без учёта авторизованного пользователя.
     *
     * @param memberId идентификатор участника
     * @return карточка участника
     */
    public MemberDetailsResponse getMemberDetails(UUID memberId) {
        return getMemberDetails(memberId, null);
    }

    /**
     * Получить детальную карточку участника с учётом текущего пользователя.
     *
     * @param memberId       идентификатор участника, чей профиль запрашивается
     * @param currentUserId  идентификатор текущего авторизованного пользователя (тренера/админа), может быть null
     * @return заполненный объект MemberDetailsResponse
     */
    public MemberDetailsResponse getMemberDetails(UUID memberId, UUID currentUserId) {
        memberPointsCacheService.recalcForUser(memberId);

        var bundle = userRepository.findUserProfileBundle(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        MemberDetailsResponse response = memberDetailsMapper.toDetails(bundle);

        // tenureMonths по profile.debutDate (если нет — 0)
        int tenureMonths = calcTenureMonths(bundle.profile() == null ? null : bundle.profile().getDebutDate());
        response.setTenureMonths(tenureMonths);

        // trainingsConductedCount + studentsCount только для COACH/ADMIN, иначе null
        String roleCode = response.getRoleCode();
        if (ROLE_COACH.equals(roleCode) || ROLE_ADMIN.equals(roleCode)) {
            long cnt = membersTrainingSessionRepository.countConductedTrainings(memberId, OffsetDateTime.now());
            response.setTrainingsConductedCount((int) cnt);

            // Количество учеников — по таблице user_trainer_links (trainer_id -> student_id)
            int studentsCount = (int) userTrainerLinkRepository.countByTrainerId(memberId);
            response.setStudentsCount(studentsCount);
        } else {
            response.setTrainingsConductedCount(null);
            response.setStudentsCount(null);
        }

        // aboutMe (profiles.about_me)
        response.setAboutMe(bundle.profile() == null ? null : bundle.profile().getAboutMe());

        // myStudent: определяем, является ли запрашиваемый участник учеником текущего тренера
        boolean myStudent = false;
        Integer remainingTrainings = null;
        if (currentUserId != null && !currentUserId.equals(memberId)) {
            Optional<com.round13.backend.domain.UserTrainerLinkEntity> link =
                    userTrainerLinkRepository.findByTrainerIdAndStudentId(currentUserId, memberId);
            myStudent = link.isPresent();
            if (myStudent) {
                remainingTrainings = link.get().getRemainingTrainings();
            }
        }
        response.setMyStudent(myStudent);
        response.setRemainingTrainings(remainingTrainings);

        return response;
    }

    private int calcTenureMonths(LocalDate debutDate) {
        if (debutDate == null) return 0;

        LocalDate now = LocalDate.now();
        if (debutDate.isAfter(now)) return 0;

        Period p = Period.between(debutDate, now);
        return p.getYears() * 12 + p.getMonths();
    }
}
