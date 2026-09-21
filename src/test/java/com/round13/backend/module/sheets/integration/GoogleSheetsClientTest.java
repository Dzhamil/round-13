package com.round13.backend.module.sheets.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.testing.http.*;
import com.google.api.services.sheets.v4.Sheets;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

class GoogleSheetsClientTest {
    @Test
    void sendsTypedRawValuesWithQuotedRangeAndPreservesCellTypesOnRead() throws Exception {
        var transport = new RecordingTransport(200, "{\"values\":[[\"name\",12,true,1.5],[]]}");
        var client = client(transport);
        assertThat(client.readRows("'Coach''s sheet'!A:Z"))
                .isEqualTo(List.of(List.of("name", "12", "true", "1.5"), List.of()));
        client.write("'Coach''s sheet'!A1", List.of(List.of("=literal", "+7999")), GoogleSheetsClient.InputMode.RAW);
        var request = transport.requests.get(1);
        assertThat(request.getUrl()).contains("valueInputOption=RAW");
        var json = new ObjectMapper().readTree(request.getContentAsString());
        assertThat(json.path("range").asText()).isEqualTo("'Coach''s sheet'!A1");
        assertThat(json.path("values").get(0).get(0).asText()).isEqualTo("=literal");
    }

    @Test
    void handlesEmptySheetsAndTranslatesApiFailureToUnavailableWithoutRetry() {
        assertThat(client(new RecordingTransport(200, "{}")).readRows("'empty'!A:Z")).isEmpty();
        var transport = new RecordingTransport(403, "{\"error\":{\"message\":\"forbidden\"}}");
        assertThatThrownBy(() -> client(transport).clear("'sheet'!A:Z"))
                .isInstanceOfSatisfying(ResponseStatusException.class, ex -> {
                    assertThat(ex.getStatusCode().value()).isEqualTo(503);
                    assertThat(ex.getReason()).contains("HTTP 403");
                });
        assertThat(transport.requests).hasSize(1);
    }

    @Test
    void malformedApiResponseRemainsAnUnavailableBoundaryError() {
        assertThatThrownBy(() -> client(new RecordingTransport(200, "not-json")).readRows("'sheet'!A:Z"))
                .isInstanceOfSatisfying(ResponseStatusException.class, ex ->
                        assertThat(ex.getStatusCode().value()).isEqualTo(503));
    }

    @Test
    void appendAndPermissionProbeRetainTheirRequestModes() throws Exception {
        var transport = new RecordingTransport(200, "{}");
        var client = client(transport);
        client.append("'sheet'!A:Z", List.of(List.of("entry")));
        assertThat(transport.requests.getFirst().getUrl())
                .contains(":append", "valueInputOption=USER_ENTERED", "insertDataOption=INSERT_ROWS");
        client.testReadWrite();
        var probe = transport.requests.getLast();
        assertThat(probe.getUrl()).endsWith(":batchUpdate");
        assertThat(new ObjectMapper().readTree(probe.getContentAsString()).path("requests").isEmpty()).isTrue();
    }

    @Test
    void readsLocaleAndNativeTableMetadataThroughTypedBoundary() {
        var transport = new RecordingTransport(200, """
                {"properties":{"locale":"ru_RU"},"sheets":[{"properties":{"sheetId":12,"title":"Участники",
                "gridProperties":{"rowCount":100,"columnCount":14}},"tables":[{"tableId":"legacy"}]}]}
                """);
        var layout = client(transport).layout();
        assertThat(layout.getProperties().getLocale()).isEqualTo("ru_RU");
        assertThat(layout.getSheets().getFirst().getTables().getFirst().getTableId()).isEqualTo("legacy");
        assertThat(layout.getSheets().getFirst().getProperties().getGridProperties().getColumnCount()).isEqualTo(14);
        assertThat(transport.requests).hasSize(1);
    }

    private GoogleSheetsClient client(RecordingTransport transport) {
        return new GoogleSheetsClient(new Sheets.Builder(transport, GsonFactory.getDefaultInstance(), request -> {
            request.setNumberOfRetries(0);
        }).setApplicationName("test").build(), "spreadsheet-id");
    }

    private static class RecordingTransport extends MockHttpTransport {
        private final int status;
        private final String content;
        private final List<MockLowLevelHttpRequest> requests = new ArrayList<>();

        RecordingTransport(int status, String content) {
            this.status = status;
            this.content = content;
        }

        @Override
        public MockLowLevelHttpRequest buildRequest(String method, String url) throws IOException {
            var request = new MockLowLevelHttpRequest(url);
            request.setResponse(new MockLowLevelHttpResponse().setStatusCode(status)
                    .setContentType("application/json").setContent(content));
            requests.add(request);
            return request;
        }
    }
}
