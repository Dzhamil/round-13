package com.round13.backend.module.members.service;

import com.round13.backend.module.members.config.MemberStatusProperties;
import com.round13.backend.module.members.dto.MemberRoleGroup;
import com.round13.backend.module.members.dto.MemberStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Резолвер текстового статуса по очкам и роли.
 *
 * Пороги берём из MemberStatusProperties (конфиг).
 */
@Component
@RequiredArgsConstructor
public class MemberStatusResolver {

    private final MemberStatusProperties props;

    public String resolve(int points, String roleCodeRaw) {
        MemberRoleGroup group = MemberRoleGroup.fromRoleCode(roleCodeRaw);

        MemberStatus status = switch (group) {
            case FIGHTER -> resolveFighter(points);
            case COACH_STAFF -> resolveCoachStaff(points);
        };

        return status.label();
    }

    private MemberStatus resolveFighter(int points) {
        if (points < props.getAmateurMin()) return MemberStatus.FIGHTER_NEWBIE;
        if (points < props.getExperiencedMin()) return MemberStatus.FIGHTER_AMATEUR;
        if (points < props.getProMin()) return MemberStatus.FIGHTER_EXPERIENCED;
        return MemberStatus.FIGHTER_PRO;
    }

    private MemberStatus resolveCoachStaff(int points) {
        if (points < props.getCoachMin()) return MemberStatus.COACH_NEWBIE;
        if (points < props.getSeniorCoachMin()) return MemberStatus.COACH;
        return MemberStatus.SENIOR_COACH;
    }
}
