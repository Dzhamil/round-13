package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Manual DB mirror of all club accounts; never imports names from display text. */
@Service
@RequiredArgsConstructor
public class ParticipantSheetSyncService {
    public record Response(int activeParticipants, int inactiveRows, int addedRows, int unmatchedRows, int duplicateRows) {}
    private final GoogleSheetSpaceRepository spaces;
    private final GoogleSheetsGateway gateway;
    private final UserRepository users;
    private final ProfileRepository profiles;

    @Transactional
    public Response syncActive() {
        var space = spaces.findActiveForUpdate().orElseThrow(() -> new ResponseStatusException(
                HttpStatus.CONFLICT, "Активное Google Sheet-пространство не настроено"));
        gateway.ensureSheet(space, "Участники");
        var plan = new PersonSheetPlan("Участники", gateway.readRows(space, "'Участники'!A:ZZ"));
        Map<UUID, UserEntity> candidates = new HashMap<>();
        users.findAllById(plan.existingIds()).forEach(user -> candidates.put(user.getId(), user));
        users.findAllWithRole().forEach(user -> candidates.put(user.getId(), user));
        Map<UUID, ProfileEntity> profileByUser = candidates.isEmpty() ? Map.of() : profiles
                .findByUserIdIn(List.copyOf(candidates.keySet())).stream()
                .collect(Collectors.toMap(profile -> profile.getUser().getId(), Function.identity()));
        var people = candidates.values().stream().map(user -> SheetPersonMapper.map(
                user, profileByUser.get(user.getId()), !user.isDeleted())).toList();
        var result = plan.reconcile(people, Instant.now().toString());
        gateway.updateValues(space, result.updates());
        return new Response(result.active(), result.inactive(), result.added(), result.unmatched(), result.duplicates());
    }
}
