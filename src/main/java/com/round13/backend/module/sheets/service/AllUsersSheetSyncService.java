package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllUsersSheetSyncService {
    public record Response(String spreadsheetId, int sourceUsers, String syncedAt) {}
    private final GoogleSheetSpaceRepository spaces;
    private final GoogleSheetsGateway gateway;
    private final UserRepository users;
    private final ProfileRepository profiles;
    private final UserTrainerLinkRepository links;
    private final AllUsersSheetMapper mapper;

    @Transactional
    public Response syncActive() {
        var space = spaces.findActiveForUpdate().orElseThrow(() -> new ResponseStatusException(
                HttpStatus.CONFLICT, "Активное Google Sheet-пространство не настроено"));
        // Exactly the current /api/panel/users source, including BLOCKED and soft DELETED.
        var source = users.findAllWithRole();
        Map<UUID, ProfileEntity> profileByUser = source.isEmpty() ? Map.of() : profiles
                .findByUserIdIn(source.stream().map(UserEntity::getId).toList()).stream()
                .collect(Collectors.toMap(p -> p.getUser().getId(), Function.identity()));
        Set<UUID> visible = source.stream().map(UserEntity::getId).collect(Collectors.toSet());
        Map<UUID, String> trainers = links.findAll().stream()
                .filter(link -> visible.contains(link.getTrainerId()) && visible.contains(link.getStudentId()))
                .collect(Collectors.groupingBy(UserTrainerLinkEntity::getStudentId,
                        Collectors.mapping(link -> link.getTrainerId().toString(),
                                Collectors.collectingAndThen(Collectors.toCollection(TreeSet::new), ids -> String.join(", ", ids)))));
        String syncedAt = Instant.now().toString();
        Map<UUID, List<Object>> rows = new HashMap<>();
        source.forEach(user -> rows.put(user.getId(), mapper.map(user, profileByUser.get(user.getId()),
                trainers.getOrDefault(user.getId(), ""), syncedAt)));
        gateway.ensureSheet(space, AllUsersSheetPlan.TITLE);
        var plan = AllUsersSheetPlan.reconcile(rows, gateway.readRows(space, "'Все пользователи'!A:ZZ"));
        gateway.formatTable(space, AllUsersSheetPlan.TITLE, plan.values().size(),
                plan.values().getFirst().size(), AllUsersSheetPlan.HEADERS.size());
        gateway.updateValues(space, List.of(plan));
        return new Response(space.getSpreadsheetId(), rows.size(), syncedAt);
    }
}
