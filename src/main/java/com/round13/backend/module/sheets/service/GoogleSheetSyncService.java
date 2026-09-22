package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import com.round13.backend.domain.UserEntity;
import org.springframework.dao.IncorrectResultSizeDataAccessException;
import com.round13.backend.module.sheets.model.TrainerSheet;
import com.round13.backend.module.sheets.dto.GoogleSheetDtos.SyncResponse;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GoogleSheetSyncService {
    private final GoogleSheetSpaceRepository spaceRepository;
    private final GoogleSheetsGateway gateway;
    private final GoogleSheetDataParser parser;
    private final UserRepository userRepository;
    private final RussianPhoneNormalizer phoneNormalizer;

    @Transactional
    public SyncResponse syncActive() {
        GoogleSheetSpaceEntity space = activeSpace();
        List<GoogleSheetDataParser.PersonRow> trainers = parser.activeTrainers(gateway.readRows(space, "'Тренеры'!A:Z"));
        List<GoogleSheetDataParser.PersonRow> participants = parser.people(gateway.readRows(space, "'Участники'!A:Z"));
        List<TrainerSheet> trainerSheets = readTrainerSheets(space, trainers);
        UpdateCount count = updateVerification(concat(trainers, participants));
        return new SyncResponse(trainers.size(), participants.size(), count.updated(), count.notFound(), trainerSheets);
    }

    /** Reads the structured schedules without changing users, trainings or Google Sheets. */
    @Transactional(readOnly = true)
    public List<TrainerSheet> readTrainerSheets() {
        GoogleSheetSpaceEntity space = activeSpace();
        return readTrainerSheets(space, parser.activeTrainers(gateway.readRows(space, "'Тренеры'!A:Z")));
    }

    private List<TrainerSheet> readTrainerSheets(GoogleSheetSpaceEntity space,
                                                List<GoogleSheetDataParser.PersonRow> trainers) {
        List<TrainerSheet> result = new ArrayList<>();
        for (GoogleSheetDataParser.PersonRow trainer : trainers) {
            String sheetName = trainer.scheduleSheet().isBlank() ? trainer.name() : trainer.scheduleSheet();
            if (sheetName.isBlank()) continue;
            var sheetId = TrainerSheetReference.sheetId(sheetName, space.getSpreadsheetId());
            if (sheetId.isPresent()) sheetName = gateway.sheetTitleById(space, sheetId.getAsInt());
            // A sheet-only A1 range includes dates beyond column Z and escapes embedded apostrophes.
            result.add(parser.trainerSheet(trainer.name(), sheetName, gateway.readRows(space, quoted(sheetName))));
        }
        return List.copyOf(result);
    }

    private UpdateCount updateVerification(List<GoogleSheetDataParser.PersonRow> people) {
        int updated = 0;
        int notFound = 0;
        List<Optional<String>> normalized = people.stream().map(p -> phoneNormalizer.normalize(p.phone())).toList();
        List<String> phones = normalized.stream().flatMap(Optional::stream).distinct().toList();
        Map<String, UserEntity> users = new HashMap<>();
        // Bound IN parameters; duplicates must still fail as the former single-result query did.
        for (int start = 0; start < phones.size(); start += 500) {
            for (UserEntity user : userRepository.findByPhoneIn(phones.subList(start, Math.min(start + 500, phones.size())))) {
                if (users.putIfAbsent(user.getPhone(), user) != null) throw new IncorrectResultSizeDataAccessException(1);
            }
        }
        Set<UUID> handled = new HashSet<>();
        List<UserEntity> changed = new ArrayList<>();
        for (int i = 0; i < people.size(); i++) {
            UserEntity user = normalized.get(i).map(users::get).orElse(null);
            if (user == null) { notFound++; continue; }
            if (!handled.add(user.getId())) continue;
            if (user.isPhoneVerifiedByStaff() != people.get(i).verified()) {
                user.setPhoneVerifiedByStaff(people.get(i).verified());
                changed.add(user);
                updated++;
            }
        }
        if (!changed.isEmpty()) userRepository.saveAll(changed);
        return new UpdateCount(updated, notFound);
    }

    private GoogleSheetSpaceEntity activeSpace() {
        GoogleSheetSpaceEntity space = spaceRepository.findByActiveTrue().orElseThrow(() ->
                new ResponseStatusException(HttpStatus.CONFLICT, "Активное Google Sheet-пространство не настроено"));
        requireCredentialsConfiguration(space);
        return space;
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
