package com.round13.backend.module.adminpanel.errorjournal.repo;

import com.round13.backend.domain.CriticalErrorEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface CriticalErrorEventRepository extends JpaRepository<CriticalErrorEventEntity, UUID>,
        JpaSpecificationExecutor<CriticalErrorEventEntity> {
}
