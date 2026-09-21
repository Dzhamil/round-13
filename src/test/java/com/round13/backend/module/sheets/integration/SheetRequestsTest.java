package com.round13.backend.module.sheets.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.model.*;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SheetRequestsTest {
    @Test
    void serializesValidationResetAndStrictTrainerOnlyDropdown() throws Exception {
        var body = new BatchUpdateSpreadsheetRequest().setRequests(SheetRequests.participantValidation(12, 34, 5));
        var actual = new ObjectMapper().readTree(GsonFactory.getDefaultInstance().toString(body));
        var expected = new ObjectMapper().readTree("""
                {"requests":[
                  {"repeatCell":{"range":{"sheetId":12},"cell":{},"fields":"dataValidation"}},
                  {"repeatCell":{"range":{"sheetId":34},"cell":{},"fields":"dataValidation"}},
                  {"setDataValidation":{"range":{"sheetId":12,"startRowIndex":1,"startColumnIndex":5,"endColumnIndex":6},
                    "rule":{"condition":{"type":"ONE_OF_RANGE","values":[{"userEnteredValue":"='Справочник тренеров'!$A$2:$A5"}]},
                      "strict":true,"showCustomUi":true}}}
                ]}
                """);
        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void keepsExistingGridSizeAndFormatsOnlyRequestedFilterColumns() {
        var sheet = new SheetProperties().setSheetId(3).setGridProperties(
                new GridProperties().setRowCount(100).setColumnCount(26));
        var requests = SheetRequests.tableFormat(sheet, 1, 12, 5);
        var grid = requests.get(0).getUpdateSheetProperties().getProperties().getGridProperties();
        assertThat(grid.getRowCount()).isEqualTo(100);
        assertThat(grid.getColumnCount()).isEqualTo(26);
        assertThat(grid.getFrozenRowCount()).isEqualTo(1);
        var filter = requests.get(1).getSetBasicFilter().getFilter().getRange();
        assertThat(filter.getEndRowIndex()).isEqualTo(2);
        assertThat(filter.getEndColumnIndex()).isEqualTo(5);
        assertThat(requests.get(2).getUpdateDimensionProperties().getProperties().getPixelSize()).isEqualTo(180);
        var header = requests.get(3).getRepeatCell();
        assertThat(header.getRange().getEndRowIndex()).isEqualTo(1);
        assertThat(header.getCell().getUserEnteredFormat().getTextFormat().getBold()).isTrue();
        assertThat(header.getCell().getUserEnteredFormat().getWrapStrategy()).isEqualTo("WRAP");
        var expanded = SheetRequests.tableFormat(sheet, 120, 30, 5).getFirst()
                .getUpdateSheetProperties().getProperties().getGridProperties();
        assertThat(expanded.getRowCount()).isEqualTo(120);
        assertThat(expanded.getColumnCount()).isEqualTo(30);
    }
}
