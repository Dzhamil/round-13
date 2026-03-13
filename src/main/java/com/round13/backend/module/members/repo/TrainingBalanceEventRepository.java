package com.round13.backend.module.members.repo;

import com.round13.backend.domain.TrainingBalanceEventEntity;
import com.round13.backend.module.members.dto.TrainingBalanceHistoryItemRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}
