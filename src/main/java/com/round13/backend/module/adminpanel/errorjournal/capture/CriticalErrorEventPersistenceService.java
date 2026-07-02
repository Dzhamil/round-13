package com.round13.backend.module.adminpanel.errorjournal.capture;

import com.round13.backend.domain.CriticalErrorEventEntity;
import com.round13.backend.module.adminpanel.errorjournal.repo.CriticalErrorEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CriticalErrorEventPersistenceService {

    private final CriticalErrorEventRepository repository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CriticalErrorEventEntity save(CriticalErrorEventEntity event) {
        return repository.save(event);
    }
}
