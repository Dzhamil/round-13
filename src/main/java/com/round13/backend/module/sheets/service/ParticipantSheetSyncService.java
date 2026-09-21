package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
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
    private final UserTrainerLinkRepository links;

    @Transactional
    public Response syncActive() {
        var space = spaces.findActiveForUpdate().orElseThrow(() -> new ResponseStatusException(
                HttpStatus.CONFLICT, "Активное Google Sheet-пространство не настроено"));
        gateway.ensureSheet(space, "Участники");
        var previous = gateway.readRows(space, "'Участники'!A:ZZ");
        var candidates = users.findAllWithRole();
        Map<UUID, ProfileEntity> profileByUser = candidates.isEmpty() ? Map.of() : profiles
                .findByUserIdIn(candidates.stream().map(UserEntity::getId).toList()).stream()
                .collect(Collectors.toMap(profile -> profile.getUser().getId(), Function.identity()));
        var trainers = candidates.stream().filter(user -> user.isTrainer() && !user.isDeleted())
                .map(user -> SheetPersonMapper.map(user, profileByUser.get(user.getId()), true)).toList();
        var participants = candidates.stream().filter(user -> !user.isTrainer() && !user.isDeleted())
                .map(user -> SheetPersonMapper.map(user, profileByUser.get(user.getId()), !user.isDeleted()))
                .toList();
        Map<UUID, UUID> primary = new HashMap<>();
        links.findAll().stream().sorted(java.util.Comparator.comparing(link -> link.getId().toString()))
                .forEach(link -> primary.putIfAbsent(link.getStudentId(), link.getTrainerId()));
        var result = ParticipantSheetPlan.build(participants, trainers, previous, primary, Instant.now().toString());
        gateway.replaceParticipantRows(space, result.participants(), result.trainers());
        return new Response(result.participants().size() - 1, 0, result.added(), 0, 0);
    }
}
