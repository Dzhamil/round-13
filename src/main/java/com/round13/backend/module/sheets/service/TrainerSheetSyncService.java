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
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class TrainerSheetSyncService {
    public record Response(String spreadsheetId, int activeTrainers, int inactiveRows, int addedRows,
                           int unmatchedRows, int duplicateRows, String syncedAt) {}
    private final GoogleSheetSpaceRepository spaces;
    private final GoogleSheetsGateway gateway;
    private final UserRepository users;
    private final ProfileRepository profiles;

    // The DB lock serializes read/reconcile/write across application instances.
    @Transactional
    public Response syncActive() {
        var space = spaces.findActiveForUpdate().orElseThrow(() -> new ResponseStatusException(
                HttpStatus.CONFLICT, "Активное Google Sheet-пространство не настроено"));
        gateway.ensureSheet(space, "Тренеры");
        var plan = new TrainerSheetPlan(gateway.readRows(space, "'Тренеры'!A:ZZ"));
        Map<UUID, UserEntity> candidates = new HashMap<>();
        users.findAllById(plan.existingIds()).forEach(user -> candidates.put(user.getId(), user));
        users.findTrainerMirrorCandidates().forEach(user -> candidates.put(user.getId(), user));
        Map<UUID, ProfileEntity> profileByUser = candidates.isEmpty() ? Map.of() : profiles
                .findByUserIdIn(List.copyOf(candidates.keySet())).stream()
                .collect(Collectors.toMap(profile -> profile.getUser().getId(), Function.identity()));
        var trainers = candidates.values().stream().map(user -> new TrainerSheetPlan.Trainer(
                user.getId(), displayName(user, profileByUser.get(user.getId())), user.getNickname(), user.getPhone(),
                user.isTrainer() && !user.isDeleted())).toList();
        String syncedAt = Instant.now().toString();
        var result = plan.reconcile(trainers, syncedAt);
        gateway.updateValues(space, result.updates());
        return new Response(space.getSpreadsheetId(), result.active(), result.inactive(), result.added(),
                result.unmatched(), result.duplicates(), syncedAt);
    }

    private String displayName(UserEntity user, ProfileEntity profile) {
        if (profile != null) {
            String name = Stream.of(profile.getSurname(), profile.getFirstName(), profile.getPatronymic())
                    .filter(Objects::nonNull).map(String::trim).filter(value -> !value.isEmpty())
                    .collect(Collectors.joining(" "));
            if (!name.isEmpty()) return name;
            if (profile.getFullName() != null && !profile.getFullName().isBlank()) return profile.getFullName().trim();
        }
        return user.getNickname() == null ? "" : user.getNickname();
    }
}
