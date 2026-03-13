// src/main/java/com/round13/backend/module/members/repo/UserTrainerLinkRepository.java
package com.round13.backend.module.members.repo;

import com.round13.backend.domain.UserTrainerLinkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface UserTrainerLinkRepository extends JpaRepository<UserTrainerLinkEntity, UUID> {

    long countByTrainerId(UUID trainerId);

    boolean existsByTrainerIdAndStudentId(UUID trainerId, UUID studentId);

    @Modifying
    @Query("""
        delete from UserTrainerLinkEntity l
        where l.trainerId = :trainerId
        and l.studentId = :studentId
    """)
    void deleteByTrainerIdAndStudentId(UUID trainerId, UUID studentId);
}
