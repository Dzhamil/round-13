package com.round13.backend.module.sheets.integration;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

import static com.round13.backend.module.sheets.integration.GoogleSheetsClient.InputMode.*;
import static com.round13.backend.module.sheets.integration.ParticipantSheetSchema.*;

/** Publishes a planned snapshot; all identity selection and deduplication stay in the planner. */
@Component
public class ParticipantSheetWriter {
    public void replace(GoogleSheetsClient client, List<List<Object>> participants, List<List<Object>> trainers) {
        client.ensureSheet(SHEET);
        client.ensureSheet(TRAINER_LOOKUP);
        var properties = client.properties();
        int participantId = sheetId(properties, SHEET);
        int lookupId = sheetId(properties, TRAINER_LOOKUP);
        client.batchUpdate(SheetRequests.participantValidation(participantId, lookupId, trainers.size()));
        client.clear(SheetRanges.exportColumns(SHEET));
        client.clear(SheetRanges.exportColumns(TRAINER_LOOKUP));

        // User text (including leading '=' and '+') must never be interpreted as a formula.
        // Only the derived trainer ID column is subsequently written as USER_ENTERED.
        List<List<Object>> rawParticipants = new ArrayList<>();
        List<List<Object>> formulas = new ArrayList<>();
        for (int index = 0; index < participants.size(); index++) {
            List<Object> row = new ArrayList<>(participants.get(index));
            if (index >= HEADER_ROWS) {
                formulas.add(List.of(row.get(Column.TRAINER_USER_ID.index())));
                row.set(Column.TRAINER_USER_ID.index(), "");
            }
            rawParticipants.add(row);
        }
        client.writeBatch(List.of(
                GoogleSheetsClient.values(SheetRanges.origin(TRAINER_LOOKUP), trainers),
                GoogleSheetsClient.values(SheetRanges.origin(SHEET), rawParticipants)), RAW);
        if (!formulas.isEmpty()) client.write(trainerFormulaOrigin(), formulas, USER_ENTERED);
    }

    private int sheetId(List<com.google.api.services.sheets.v4.model.SheetProperties> properties, String name) {
        return properties.stream().filter(p -> name.equals(p.getTitle())).findFirst()
                .orElseThrow(() -> SheetsErrors.unavailable("Не удалось найти лист " + name, null)).getSheetId();
    }
}
