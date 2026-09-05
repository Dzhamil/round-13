package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import com.round13.backend.module.sheets.dto.GoogleSheetDtos.SheetTraining;
import com.round13.backend.module.sheets.dto.GoogleSheetDtos.SyncResponse;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GoogleSheetSyncService {
    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Europe/Moscow");
    private final GoogleSheetSpaceRepository spaceRepository;
    private final GoogleSheetsGateway gateway;
    private final GoogleSheetDataParser parser;
    private final UserRepository userRepository;
    private final RussianPhoneNormalizer phoneNormalizer;

    @Transactional
    public SyncResponse syncActive() {
        GoogleSheetSpaceEntity space = spaceRepository.findByActiveTrue().orElseThrow(() ->
                new ResponseStatusException(HttpStatus.CONFLICT, "Активное Google Sheet-пространство не настроено"));
        requireCredentialsConfiguration(space);
        List<GoogleSheetDataParser.PersonRow> trainers = parser.people(gateway.readRows(space, "'Тренеры'!A:Z"));
        List<GoogleSheetDataParser.PersonRow> participants = parser.people(gateway.readRows(space, "'Участники'!A:Z"));
        UpdateCount count = updateVerification(concat(trainers, participants));
        List<SheetTraining> trainings = new ArrayList<>();
        for (GoogleSheetDataParser.PersonRow trainer : trainers) {
            String sheetName = trainer.scheduleSheet().isBlank() ? trainer.name() : trainer.scheduleSheet();
            if (sheetName.isBlank()) continue;
            for (GoogleSheetDataParser.TrainingRow row : parser.trainings(
                    gateway.readRows(space, quoted(sheetName) + "!A:Z"), DEFAULT_ZONE)) {
                trainings.add(new SheetTraining(trainer.name(), sheetName, row.title(), row.type(), row.sourceType(),
                        row.startTime(), row.schedule(), row.durationMinutes(), row.location(), row.active()));
            }
        }
        return new SyncResponse(trainers.size(), participants.size(), count.updated(), count.notFound(), List.copyOf(trainings));
    }

    private UpdateCount updateVerification(List<GoogleSheetDataParser.PersonRow> people) {
        int updated = 0;
        int notFound = 0;
        Set<UUID> handled = new HashSet<>();
        for (GoogleSheetDataParser.PersonRow person : people) {
            Optional<String> normalized = phoneNormalizer.normalize(person.phone());
            var user = normalized.flatMap(userRepository::findByPhone);
            if (user.isEmpty()) { notFound++; continue; }
            if (!handled.add(user.get().getId())) continue;
            if (user.get().isPhoneVerifiedByStaff() != person.verified()) {
                user.get().setPhoneVerifiedByStaff(person.verified());
                userRepository.save(user.get());
                updated++;
            }
        }
        return new UpdateCount(updated, notFound);
    }

    private void requireCredentialsConfiguration(GoogleSheetSpaceEntity space) {
        if (space.getCredentialsEnvVar() == null || space.getCredentialsEnvVar().isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Не настроена переменная окружения credentials Google Sheets");
        }
    }
    private List<GoogleSheetDataParser.PersonRow> concat(List<GoogleSheetDataParser.PersonRow> first,
                                                          List<GoogleSheetDataParser.PersonRow> second) {
        List<GoogleSheetDataParser.PersonRow> result = new ArrayList<>(first); result.addAll(second); return result;
    }
    private String quoted(String sheetName) { return "'" + sheetName.replace("'", "''") + "'"; }
    private record UpdateCount(int updated, int notFound) {}
}
