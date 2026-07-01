package com.round13.backend.module.members.potential;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoxerPotentialMeasurementRepository extends JpaRepository<BoxerPotentialMeasurementEntity, UUID> {

    Optional<BoxerPotentialMeasurementEntity> findTopByMemberIdOrderByMeasuredAtDescCreatedAtDesc(UUID memberId);

    List<BoxerPotentialMeasurementEntity> findByMemberIdOrderByMeasuredAtDescCreatedAtDesc(UUID memberId, Pageable pageable);

    @Query(value = """
            select latest.member_id as memberId,
                   u.nickname as nickname,
                   p.avatar_url as avatarUrl,
                   latest.measured_at as measuredAt,
                   latest.potential_score as potentialScore,
                   latest.strength_score as strengthScore,
                   latest.endurance_score as enduranceScore,
                   latest.speed_score as speedScore,
                   latest.agility_score as agilityScore
            from (
                select bpm.*,
                       row_number() over (partition by bpm.member_id order by bpm.measured_at desc, bpm.created_at desc) as rn
                from boxer_potential_measurements bpm
            ) latest
            join users u on u.id = latest.member_id
            left join profiles p on p.user_id = u.id
            where latest.rn = 1
              and latest.norm_group = :normGroup
              and u.status <> 'DELETED'
            order by latest.potential_score desc, latest.measured_at desc, latest.created_at desc
            """, nativeQuery = true)
    List<BoxerPotentialLeaderboardRow> findLeaderboard(
            @Param("normGroup") String normGroup,
            Pageable pageable
    );
}
