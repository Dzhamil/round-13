package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import java.util.List;

public interface GoogleSheetsGateway {
    void testReadWrite(GoogleSheetSpaceEntity space);
    List<List<String>> readRows(GoogleSheetSpaceEntity space, String range);
    void appendRows(GoogleSheetSpaceEntity space, String sheetName, List<List<Object>> rows);
    void replaceRows(GoogleSheetSpaceEntity space, String sheetName, List<List<Object>> rows);
}
