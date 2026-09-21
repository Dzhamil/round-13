package com.round13.backend.module.sheets.integration;

import com.google.api.services.sheets.v4.model.SheetProperties;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static com.round13.backend.module.sheets.integration.GoogleSheetsClient.InputMode.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ParticipantSheetWriterTest {
    @Test
    void replacesSnapshotInOrderWithoutMutatingInputOrInterpretingUserText() {
        var client = client();
        var writer = new ParticipantSheetWriter();
        List<Object> header = new ArrayList<>(ParticipantSheetSchema.HEADERS);
        String formula = ParticipantSheetSchema.trainerLookupFormula(2);
        List<Object> row = List.of("id", "=name", "@nick", "+79990000000", "Да", "Trainer", formula,
                "Синхронизирован", "now", "Surname", "First", "");
        List<List<Object>> participants = List.of(header, row);
        List<List<Object>> trainers = List.of(List.of("Тренер", "trainer_user_id"), List.of("Trainer", "trainer-id"));
        var rawRow = new ArrayList<>(row);
        rawRow.set(6, "");

        // Running the same snapshot twice must produce the same writes, never append.
        for (int run = 0; run < 2; run++) {
            clearInvocations(client);
            writer.replace(client, participants, trainers);
            var order = inOrder(client);
            order.verify(client).ensureSheet("Участники");
            order.verify(client).ensureSheet("Справочник тренеров");
            order.verify(client).properties();
            order.verify(client).batchUpdate(SheetRequests.participantValidation(12, 34, 2));
            order.verify(client).clear("'Участники'!A:Z");
            order.verify(client).clear("'Справочник тренеров'!A:Z");
            order.verify(client).writeBatch(List.of(
                    GoogleSheetsClient.values("'Справочник тренеров'!A1", trainers),
                    GoogleSheetsClient.values("'Участники'!A1", List.of(header, rawRow))), RAW);
            order.verify(client).write("'Участники'!G2", List.of(List.of(formula)), USER_ENTERED);
            order.verifyNoMoreInteractions();
            assertThat(row.get(6)).isEqualTo(formula);
            assertThat(header).containsExactlyElementsOf(ParticipantSheetSchema.HEADERS);
        }
    }

    @Test
    void headerOnlySnapshotClearsOldRowsButDoesNotWriteFormulas() {
        var client = client();
        new ParticipantSheetWriter().replace(client, List.of(new ArrayList<>(ParticipantSheetSchema.HEADERS)),
                List.of(new ArrayList<>(ParticipantSheetSchema.TRAINER_HEADERS)));
        verify(client).batchUpdate(SheetRequests.participantValidation(12, 34, 1));
        verify(client).clear("'Участники'!A:Z");
        verify(client).clear("'Справочник тренеров'!A:Z");
        verify(client, never()).write(anyString(), anyList(), any());
    }

    private GoogleSheetsClient client() {
        var client = mock(GoogleSheetsClient.class);
        when(client.properties()).thenReturn(List.of(new SheetProperties().setTitle("Участники").setSheetId(12),
                new SheetProperties().setTitle("Справочник тренеров").setSheetId(34)));
        return client;
    }
}
