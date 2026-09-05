package com.round13.backend.module.sheets.repo;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GoogleSheetSpaceRepository extends JpaRepository<GoogleSheetSpaceEntity, UUID> {
    Optional<GoogleSheetSpaceEntity> findByActiveTrue();
    List<GoogleSheetSpaceEntity> findAllByOrderByCreatedAtDesc();
    @Modifying @Query("update GoogleSheetSpaceEntity s set s.active = false where s.active = true")
    void deactivateAll();
}
