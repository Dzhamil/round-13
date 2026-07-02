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

    @Query("""
            select new com.round13.backend.module.members.potential.BoxerPotentialLeaderboardRow(
                bpm.member.id,
                u.nickname,
                p.avatarUrl,
                bpm.measuredAt,
                bpm.potentialScore,
                bpm.strengthScore,
                bpm.enduranceScore,
                bpm.speedScore,
                bpm.agilityScore
            )
            from BoxerPotentialMeasurementEntity bpm
            join bpm.member u
            left join ProfileEntity p on p.user = u
            where bpm.normGroup = :normGroup
              and u.status <> com.round13.backend.domain.UserStatus.DELETED
              and not exists (
                  select 1
                  from BoxerPotentialMeasurementEntity newer
                  where newer.member = bpm.member
                    and (
                        newer.measuredAt > bpm.measuredAt
                        or (newer.measuredAt = bpm.measuredAt and newer.createdAt > bpm.createdAt)
                    )
              )
            order by bpm.potentialScore desc, bpm.measuredAt desc, bpm.createdAt desc
            """)
    List<BoxerPotentialLeaderboardRow> findLeaderboard(
            @Param("normGroup") BoxerPotentialNormGroup normGroup,
            Pageable pageable
    );
}
