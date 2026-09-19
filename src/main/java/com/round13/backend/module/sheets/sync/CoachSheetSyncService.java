package com.round13.backend.module.sheets.sync;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.sheets.service.GoogleSheetsGateway;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoachSheetSyncService {
    private final GoogleSheetSpaceRepository spaces;
    private final UserRepository users;
    private final ProfileRepository profiles;
    private final CoachSheetChangeRepository changes;
    private final CoachSheetPlan planner;
    private final GoogleSheetsGateway gateway;

    /** Full reconciliation also repairs missed events and populates a newly activated space. */
    @Transactional(isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public void syncActive() {
        var active = spaces.findActiveForUpdate();
        if (active.isEmpty()) return;
        var space = active.get();
        if (space.getCredentialsEnvVar() == null || space.getCredentialsEnvVar().isBlank()) return;
        var pending = changes.findAll();
        var roster = users.findAllWithRole();
        var profileMap = profiles.findByUserIdIn(roster.stream().map(UserEntity::getId).toList()).stream()
                .collect(Collectors.toMap(profile -> profile.getUser().getId(), Function.identity()));
        var writes = planner.build(gateway.readRows(space, "'Тренеры'!A:Z"), roster, profileMap, pending);
        gateway.writeCells(space, writes);
        changes.deleteAll(pending);
    }
}
