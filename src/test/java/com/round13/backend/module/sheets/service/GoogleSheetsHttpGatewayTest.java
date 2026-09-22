package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import com.round13.backend.module.sheets.integration.GoogleSheetsClient;
import com.round13.backend.module.sheets.integration.GoogleSheetsClientFactory;
import com.round13.backend.module.sheets.integration.ParticipantSheetWriter;
import com.google.api.services.sheets.v4.model.SheetProperties;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.round13.backend.module.sheets.integration.GoogleSheetsClient.InputMode.RAW;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class GoogleSheetsHttpGatewayTest {
    private final GoogleSheetsClientFactory factory = mock(GoogleSheetsClientFactory.class);
    private final GoogleSheetsClient client = mock(GoogleSheetsClient.class);
    private final ParticipantSheetWriter writer = mock(ParticipantSheetWriter.class);
    private final GoogleSheetsHttpGateway gateway = new GoogleSheetsHttpGateway(factory, writer);
    private final GoogleSheetSpaceEntity space = new GoogleSheetSpaceEntity();

    @Test
    void emptyAppendDoesNotAuthenticateOrCreateTab() {
        gateway.appendRows(space, "sheet", List.of());
        verifyNoInteractions(factory, client, writer);
    }

    @Test
    void replacesAllUsersSnapshotByClearingBeforeWritingRawValues() {
        when(factory.open(space)).thenReturn(client);
        List<List<Object>> rows = List.of(List.of("user_id", "name"), List.of("id", "=literal"));
        gateway.replaceRows(space, "All users' tab", rows);
        var order = inOrder(client);
        order.verify(client).ensureSheet("All users' tab");
        order.verify(client).clear("'All users'' tab'!A:Z");
        order.verify(client).write("'All users'' tab'!A1", rows, RAW);
        order.verifyNoMoreInteractions();
    }

    @Test
    void trainerUpdatesRetainRawModeAndCallerSuppliedRanges() {
        when(factory.open(space)).thenReturn(client);
        List<List<Object>> rows = List.of(List.of("+7999"));
        gateway.updateValues(space, List.of(new GoogleSheetsGateway.ValueUpdate("'Тренеры'!D2", rows)));
        verify(client).writeBatch(List.of(GoogleSheetsClient.values("'Тренеры'!D2", rows)), RAW);
        verifyNoMoreInteractions(client);
    }

    @Test
    void trainerSpaceCreatesMissingTabWritesBaseTemplateOnlyWhenEmptyAndReturnsGidLink() {
        space.setSpreadsheetId("spreadsheet-id");
        when(factory.open(space)).thenReturn(client);
        when(client.requireSheet("Иванов Иван · 126457ca"))
                .thenReturn(new SheetProperties().setSheetId(123456).setTitle("Иванов Иван · 126457ca"));
        when(client.readRows("'Иванов Иван · 126457ca'!A:Z")).thenReturn(List.of());

        String link = gateway.ensureTrainerSpace(space, "Иванов Иван", "126457ca-c578-4016-9c14-1c21c5121053");

        assertThat(link).isEqualTo("https://docs.google.com/spreadsheets/d/spreadsheet-id/edit#gid=123456");
        var order = inOrder(client);
        order.verify(client).ensureSheet("Иванов Иван · 126457ca");
        order.verify(client).requireSheet("Иванов Иван · 126457ca");
        order.verify(client).readRows("'Иванов Иван · 126457ca'!A:Z");
        order.verify(client).write(eq("'Иванов Иван · 126457ca'!A1"), argThat(rows ->
                rows.size() == 7 && rows.get(5).contains("ID тренировки")), eq(RAW));
        order.verifyNoMoreInteractions();
    }

    @Test
    void trainerSpaceDoesNotRewriteExistingTab() {
        space.setSpreadsheetId("spreadsheet-id");
        when(factory.open(space)).thenReturn(client);
        when(client.requireSheet("Тренер Name · abcdef12"))
                .thenReturn(new SheetProperties().setSheetId(77).setTitle("Тренер Name · abcdef12"));
        when(client.readRows("'Тренер Name · abcdef12'!A:Z")).thenReturn(List.of(List.of("manual data")));

        assertThat(gateway.ensureTrainerSpace(space, "Тренер/Name", "abcdef12-0000"))
                .isEqualTo("https://docs.google.com/spreadsheets/d/spreadsheet-id/edit#gid=77");

        verify(client, never()).write(anyString(), any(), any());
    }
}
