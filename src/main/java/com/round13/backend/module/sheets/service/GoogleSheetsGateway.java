package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import java.util.List;

public interface GoogleSheetsGateway {
    record ValueUpdate(String range, List<List<Object>> values) {}
    void formatTable(GoogleSheetSpaceEntity space, String name, int rows, int columns, int filterColumns);
    void ensureSheet(GoogleSheetSpaceEntity space, String name);
    String ensureTrainerSpace(GoogleSheetSpaceEntity space, String trainerName, String userId);
    void updateValues(GoogleSheetSpaceEntity space, List<ValueUpdate> updates);
    void testReadWrite(GoogleSheetSpaceEntity space);
    List<List<String>> readRows(GoogleSheetSpaceEntity space, String range);
    String sheetTitleById(GoogleSheetSpaceEntity space, int sheetId);
    void appendRows(GoogleSheetSpaceEntity space, String sheetName, List<List<Object>> rows);
    void replaceParticipantRows(GoogleSheetSpaceEntity space, List<List<Object>> participants, List<List<Object>> trainers);
    void replaceRows(GoogleSheetSpaceEntity space, String sheetName, List<List<Object>> rows);
}
