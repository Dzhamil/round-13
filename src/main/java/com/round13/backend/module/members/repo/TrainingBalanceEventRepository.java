package com.round13.backend.module.members.repo;

import com.round13.backend.domain.TrainingBalanceEventEntity;
import com.round13.backend.module.members.dto.TrainingBalanceHistoryItemRow;
import com.round13.backend.module.profile.dto.ProfilePersonalEntitlementActivityRow;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TrainingBalanceEventRepository extends JpaRepository<TrainingBalanceEventEntity, UUID> {

    @Query("""
            select new com.round13.backend.module.members.dto.TrainingBalanceHistoryItemRow(
                e.id,
                e.studentId,
                student.nickname,
                e.delta,
                e.balanceAfter,
                e.eventType,
                e.createdByUserId,
                coalesce(actor.nickname, 'Сотрудник'),
                e.createdAt
            )
            from TrainingBalanceEventEntity e
            join UserEntity student on student.id = e.studentId
            left join UserEntity actor on actor.id = e.createdByUserId
            where e.trainerId = :trainerId
            order by e.createdAt desc
            """)
    List<TrainingBalanceHistoryItemRow> findHistoryByTrainerId(UUID trainerId);

    @Query("""
            select new com.round13.backend.module.members.dto.TrainingBalanceHistoryItemRow(
                e.id,
                e.studentId,
                student.nickname,
                e.delta,
                e.balanceAfter,
                e.eventType,
                e.createdByUserId,
                coalesce(actor.nickname, 'Сотрудник'),
                e.createdAt
            )
            from TrainingBalanceEventEntity e
            join UserEntity student on student.id = e.studentId
            left join UserEntity actor on actor.id = e.createdByUserId
            where e.trainerId = :trainerId
              and e.studentId = :studentId
            order by e.createdAt desc
            """)
    List<TrainingBalanceHistoryItemRow> findTop5ByTrainerIdAndStudentIdOrderByCreatedAtDesc(
            @Param("trainerId") UUID trainerId,
            @Param("studentId") UUID studentId,
            Pageable pageable
    );

    @Query("""
            select new com.round13.backend.module.members.dto.TrainingBalanceHistoryItemRow(
                e.id,
                e.studentId,
                student.nickname,
                e.delta,
                e.balanceAfter,
                e.eventType,
                e.createdByUserId,
                coalesce(actor.nickname, 'Сотрудник'),
                e.createdAt
            )
            from TrainingBalanceEventEntity e
            join UserEntity student on student.id = e.studentId
            left join UserEntity actor on actor.id = e.createdByUserId
            where e.trainerId = :trainerId
              and e.studentId = :studentId
            order by e.createdAt desc
            """)
    List<TrainingBalanceHistoryItemRow> findByTrainerIdAndStudentIdOrderByCreatedAtDesc(
            @Param("trainerId") UUID trainerId,
            @Param("studentId") UUID studentId
    );

    @Query("""
            select new com.round13.backend.module.profile.dto.ProfilePersonalEntitlementActivityRow(
                e.id,
                coalesce(
                    trainer.nickname,
                    case when trainer.phoneHidden = false then trainer.phone else 'Тренер' end
                ),
                e.eventType,
                e.delta,
                e.balanceAfter,
                e.createdAt
            )
            from TrainingBalanceEventEntity e
            left join UserEntity trainer on trainer.id = e.trainerId
            where e.studentId = :studentId
            order by e.createdAt desc
            """)
    List<ProfilePersonalEntitlementActivityRow> findRecentByStudentId(UUID studentId, Pageable pageable);
}
