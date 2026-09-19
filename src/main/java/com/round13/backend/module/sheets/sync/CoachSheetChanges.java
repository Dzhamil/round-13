package com.round13.backend.module.sheets.sync;

import com.round13.backend.domain.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CoachSheetChanges {
    private final CoachSheetChangeRepository repository;

    @Transactional(propagation = Propagation.MANDATORY)
    public void record(UserEntity user, String previousPhone) {
        repository.save(new CoachSheetChange(user.getId(), previousPhone));
    }
}
