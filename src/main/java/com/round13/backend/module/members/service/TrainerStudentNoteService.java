package com.round13.backend.module.members.service;

import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.members.dto.TrainerStudentNoteResponse;
import com.round13.backend.module.members.mapper.TrainerStudentCardMapper;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TrainerStudentNoteService {

    private final UserTrainerLinkRepository userTrainerLinkRepository;
    private final TrainerStudentCardMapper trainerStudentCardMapper;
    private final MemberUserLabelResolver memberUserLabelResolver;

    public TrainerStudentNoteResponse updateCoachNote(UUID trainerId, UUID studentId, String note, UUID actorUserId) {
        UserTrainerLinkEntity link = userTrainerLinkRepository.findByTrainerIdAndStudentId(trainerId, studentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REQUEST));

        String normalizedNote = normalize(note);
        link.setCoachNote(normalizedNote);
        link.setCoachNoteUpdatedAt(OffsetDateTime.now());
        link.setCoachNoteUpdatedByUserId(actorUserId);
        userTrainerLinkRepository.save(link);

        return trainerStudentCardMapper.toNote(link, memberUserLabelResolver.resolveByUserId(actorUserId));
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
