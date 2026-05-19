package com.round13.backend.module.members.repo;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.members.dto.MemberListItemRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Репозиторий чтения списка участников клуба.
 */
@Repository
public interface MembersReadRepository extends JpaRepository<UserEntity, UUID> {

    @Query("""
            select new com.round13.backend.module.members.dto.MemberListItemRow(
                u.id,
                u.nickname,
                u.phone,
                p.avatarUrl,
                coalesce(s.points, 0),
                coalesce(s.statusLabel, '—'),
                r.code
            )
            from UserEntity u
            join u.role r
            left join ProfileEntity p on p.user = u
            left join UserStatsEntity s on s.user = u
            where r.code not in ('COACH', 'ADMIN')
              and u.status <> com.round13.backend.domain.UserStatus.DELETED
            order by u.createdAt desc
            """)
    List<MemberListItemRow> findFighters();

    @Query("""
            select new com.round13.backend.module.members.dto.MemberListItemRow(
                u.id,
                u.nickname,
                u.phone,
                p.avatarUrl,
                coalesce(s.points, 0),
                coalesce(s.statusLabel, '—'),
                r.code
            )
            from UserEntity u
            join u.role r
            left join ProfileEntity p on p.user = u
            left join UserStatsEntity s on s.user = u
            where r.code in ('COACH', 'ADMIN')
              and u.status <> com.round13.backend.domain.UserStatus.DELETED
            order by u.createdAt desc
            """)
    List<MemberListItemRow> findCoaches();

    @Query("""
            select new com.round13.backend.module.members.dto.MemberListItemRow(
                u.id,
                u.nickname,
                u.phone,
                p.avatarUrl,
                coalesce(s.points, 0),
                coalesce(s.statusLabel, '—'),
                r.code,
                link.remainingTrainings
            )
            from UserTrainerLinkEntity link
            join UserEntity u on u.id = link.studentId
            join u.role r
            left join ProfileEntity p on p.user = u
            left join UserStatsEntity s on s.user = u
            where link.trainerId = :trainerId
              and u.status <> com.round13.backend.domain.UserStatus.DELETED
            order by u.createdAt desc
            """)
    List<MemberListItemRow> findStudentsByTrainerId(UUID trainerId);
}
