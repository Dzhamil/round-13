package com.round13.backend.module.members.service;

import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.module.members.dto.StudentOperationalStatusCode;
import com.round13.backend.module.members.dto.StudentOperationalStatusResponse;
import org.springframework.stereotype.Component;

@Component
public class TrainerStudentStatusResolver {
    public StudentOperationalStatusResponse resolve(UserTrainerLinkEntity link) {
        // Only the balance is known; absence cannot be inferred from deleted attendance.
        return link.getRemainingTrainings() <= 1
                ? new StudentOperationalStatusResponse(StudentOperationalStatusCode.RISK, null)
                : null;
    }
}
