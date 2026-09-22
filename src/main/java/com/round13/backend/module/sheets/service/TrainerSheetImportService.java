package com.round13.backend.module.sheets.service;

import com.round13.backend.module.sheets.model.TrainerSheet;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/** A failed trainer rolls back alone. The space lock covers reading AND applying to avoid stale overlapping snapshots. */
@Service
@RequiredArgsConstructor
public class TrainerSheetImportService {
    public record Result(String sheetName, String status, TrainerSheet sheet, TrainerSheetPersistenceService.Counts counts) {}
    private final GoogleSheetSpaceRepository spaces;
    private final GoogleSheetsGateway gateway;
    private final GoogleSheetDataParser parser;
    private final TrainerSheetUserResolver users;
    private final TrainerSheetPersistenceService persistence;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Result importSheet(UUID spaceId, GoogleSheetDataParser.PersonRow trainer) {
        var space = spaces.findActiveByIdForUpdate(spaceId)
                .orElseThrow(() -> new IllegalArgumentException("Google Sheets пространство больше не активно"));
        String sheetName = trainer.scheduleSheet().isBlank() ? trainer.name() : trainer.scheduleSheet();
        var sheetId = TrainerSheetReference.sheetId(sheetName, space.getSpreadsheetId());
        if (sheetId.isPresent()) sheetName = gateway.sheetTitleById(space, sheetId.getAsInt());
        if (sheetName.isBlank()) throw new IllegalArgumentException("Не указана личная вкладка тренера");
        var rows = gateway.readRows(space, "'" + sheetName.replace("'", "''") + "'");
        if (!TrainerSheetSyncFlag.enabled(sheetName, rows)) return new Result(sheetName, "SKIPPED_SYNC_DISABLED", null, null);
        var sheet = parser.trainerSheet(trainer.name(), sheetName, rows);
        var directory = users.load();
        var coach = directory.trainer(trainer);
        var plan = TrainerSheetImportPlan.from(sheet, directory);
        return new Result(sheetName, "IMPORTED", sheet, persistence.apply(space.getSpreadsheetId(), coach, plan));
    }
}
