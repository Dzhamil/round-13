package com.round13.backend.module.members.service;

import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TrainerStudentRelationshipService {

    private final UserTrainerLinkRepository userTrainerLinkRepository;

    @PreAuthorize("hasAnyRole('COACH','ADMIN')")
    public void removeOwnStudent(UUID trainerId, UUID studentId) {
        userTrainerLinkRepository.deleteByTrainerIdAndStudentId(trainerId, studentId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void removeAsAdmin(UUID adminUserId, UUID trainerStudentLinkId) {
        UserTrainerLinkEntity link = userTrainerLinkRepository.findById(trainerStudentLinkId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        log.info(
                "ADMIN {} removed trainer-student link {} trainer={} student={}",
                adminUserId,
                link.getId(),
                link.getTrainerId(),
                link.getStudentId()
        );

        userTrainerLinkRepository.delete(link);
    }
}
