package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import com.round13.backend.module.sheets.integration.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

import static com.round13.backend.module.sheets.integration.GoogleSheetsClient.InputMode.RAW;

/** Adapts the sync port to the Google Sheets integration boundary. */
@Component
@RequiredArgsConstructor
public class GoogleSheetsHttpGateway implements GoogleSheetsGateway {
    private final GoogleSheetsClientFactory clients;
    private final ParticipantSheetWriter participants;

    @Override
    public void testReadWrite(GoogleSheetSpaceEntity space) {
        clients.open(space).testReadWrite();
    }

    @Override
    public List<List<String>> readRows(GoogleSheetSpaceEntity space, String range) {
        return clients.open(space).readRows(range);
    }

    @Override
    public void appendRows(GoogleSheetSpaceEntity space, String sheetName, List<List<Object>> rows) {
        if (rows.isEmpty()) return;
        var client = clients.open(space);
        client.ensureSheet(sheetName);
        client.append(SheetRanges.exportColumns(sheetName), rows);
    }

    @Override
    public void replaceRows(GoogleSheetSpaceEntity space, String sheetName, List<List<Object>> rows) {
        var client = clients.open(space);
        client.ensureSheet(sheetName);
        client.clear(SheetRanges.exportColumns(sheetName));
        client.write(SheetRanges.origin(sheetName), rows, RAW);
    }

    @Override
    public void replaceParticipantRows(GoogleSheetSpaceEntity space, List<List<Object>> rows, List<List<Object>> trainers) {
        participants.replace(clients.open(space), rows, trainers);
    }

    @Override
    public void ensureSheet(GoogleSheetSpaceEntity space, String name) {
        clients.open(space).ensureSheet(name);
    }

    @Override
    public void updateValues(GoogleSheetSpaceEntity space, List<ValueUpdate> updates) {
        clients.open(space).writeBatch(updates.stream()
                .map(update -> GoogleSheetsClient.values(update.range(), update.values())).toList(), RAW);
    }

    @Override
    public void formatTable(GoogleSheetSpaceEntity space, String name, int rows, int columns, int filterColumns) {
        var client = clients.open(space);
        client.batchUpdate(SheetRequests.tableFormat(client.requireSheet(name), rows, columns, filterColumns));
    }
}
