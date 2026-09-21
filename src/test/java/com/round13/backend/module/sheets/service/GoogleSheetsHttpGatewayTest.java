package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import com.round13.backend.module.sheets.integration.GoogleSheetsClient;
import com.round13.backend.module.sheets.integration.GoogleSheetsClientFactory;
import com.round13.backend.module.sheets.integration.ParticipantSheetWriter;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.round13.backend.module.sheets.integration.GoogleSheetsClient.InputMode.RAW;
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
}
