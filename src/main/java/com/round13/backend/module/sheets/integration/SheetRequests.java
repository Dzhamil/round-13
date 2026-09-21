package com.round13.backend.module.sheets.integration;

import com.google.api.services.sheets.v4.model.*;

import java.util.List;

/** Typed, side-effect-free builders for spreadsheet structure and presentation. */
public final class SheetRequests {
    private static final int MINIMUM_TABLE_ROWS = 2;
    private static final int COLUMN_WIDTH_PIXELS = 180;
    private static final int TABLE_HEADER_ROWS = 1;

    private SheetRequests() {}

    public static List<Request> participantValidation(int participantId, int lookupId, int lookupRows) {
        var trainerColumn = ParticipantSheetSchema.Column.TRAINER;
        var rule = new DataValidationRule()
                .setCondition(new BooleanCondition().setType("ONE_OF_RANGE").setValues(List.of(
                        new ConditionValue().setUserEnteredValue(ParticipantSheetSchema.trainerDropdownSource(lookupRows)))))
                .setStrict(true).setShowCustomUi(true);
        return List.of(clearValidation(participantId), clearValidation(lookupId),
                new Request().setSetDataValidation(new SetDataValidationRequest()
                        .setRange(new GridRange().setSheetId(participantId)
                                .setStartRowIndex(ParticipantSheetSchema.HEADER_ROWS)
                                .setStartColumnIndex(trainerColumn.index()).setEndColumnIndex(trainerColumn.index() + 1))
                        .setRule(rule)));
    }

    private static Request clearValidation(int sheetId) {
        return new Request().setRepeatCell(new RepeatCellRequest().setRange(new GridRange().setSheetId(sheetId))
                .setCell(new CellData()).setFields("dataValidation"));
    }

    public static List<Request> tableFormat(SheetProperties sheet, int rows, int columns, int filterColumns) {
        int id = sheet.getSheetId();
        var currentGrid = sheet.getGridProperties();
        int tableRows = Math.max(MINIMUM_TABLE_ROWS, rows);
        var grid = new GridProperties().setRowCount(Math.max(tableRows, currentGrid.getRowCount()))
                .setColumnCount(Math.max(columns, currentGrid.getColumnCount())).setFrozenRowCount(TABLE_HEADER_ROWS);
        return List.of(
                new Request().setUpdateSheetProperties(new UpdateSheetPropertiesRequest()
                        .setProperties(new SheetProperties().setSheetId(id).setGridProperties(grid))
                        .setFields("gridProperties.rowCount,gridProperties.columnCount,gridProperties.frozenRowCount")),
                new Request().setSetBasicFilter(new SetBasicFilterRequest().setFilter(new BasicFilter()
                        .setRange(new GridRange().setSheetId(id).setStartRowIndex(0).setEndRowIndex(tableRows)
                                .setStartColumnIndex(0).setEndColumnIndex(filterColumns)))),
                new Request().setUpdateDimensionProperties(new UpdateDimensionPropertiesRequest()
                        .setRange(new DimensionRange().setSheetId(id).setDimension("COLUMNS")
                                .setStartIndex(0).setEndIndex(filterColumns))
                        .setProperties(new DimensionProperties().setPixelSize(COLUMN_WIDTH_PIXELS)).setFields("pixelSize")),
                new Request().setRepeatCell(new RepeatCellRequest()
                        .setRange(new GridRange().setSheetId(id).setStartRowIndex(0).setEndRowIndex(TABLE_HEADER_ROWS))
                        .setCell(new CellData().setUserEnteredFormat(new CellFormat()
                                .setTextFormat(new TextFormat().setBold(true)).setWrapStrategy("WRAP")))
                        .setFields("userEnteredFormat")));
    }
}
