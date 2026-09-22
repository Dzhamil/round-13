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
    public String ensureTrainerSpace(GoogleSheetSpaceEntity space, String trainerName, String userId) {
        var client = clients.open(space);
        String title = trainerSheetTitle(trainerName, userId);
        client.ensureSheet(title);
        var sheet = client.requireSheet(title);
        if (client.readRows(SheetRanges.exportColumns(title)).isEmpty()) {
            client.write(SheetRanges.origin(title), trainerSpaceTemplate(trainerName), RAW);
        }
        return "https://docs.google.com/spreadsheets/d/" + space.getSpreadsheetId() + "/edit#gid=" + sheet.getSheetId();
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

    private static String trainerSheetTitle(String trainerName, String userId) {
        String base = trainerName == null || trainerName.isBlank() ? "Тренер" : trainerName.trim();
        String suffix = " · " + userId.substring(0, Math.min(8, userId.length()));
        int maxBaseLength = 100 - suffix.length();
        return sanitizeTitle(base.substring(0, Math.min(base.length(), maxBaseLength)) + suffix);
    }

    private static String sanitizeTitle(String title) {
        return title.replaceAll("[\\\\/?*\\[\\]:]", " ").replaceAll("\\s+", " ").trim();
    }

    private static List<List<Object>> trainerSpaceTemplate(String trainerName) {
        String displayName = trainerName == null || trainerName.isBlank() ? "Тренер" : trainerName.trim();
        return List.of(
                List.of("", "Таблица тренера: " + displayName, "", "", "", ""),
                List.of("", "", "", "", "", ""),
                List.of("", "", "", "", "", ""),
                List.of("", "Синхронизация", Boolean.FALSE, "", "", ""),
                List.of("", "", "", "", "", ""),
                List.of("", "ID тренировки", "Тип тренировки", "Название тренировки", "Длительность", "Детальная таблица"),
                List.of("", "", "", "", "", "")
        );
    }
}
