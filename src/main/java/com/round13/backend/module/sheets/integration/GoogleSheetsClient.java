package com.round13.backend.module.sheets.integration;

import com.google.api.client.http.HttpResponseException;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

/** One spreadsheet session. Owns API calls and error translation, never sync decisions. */
public class GoogleSheetsClient {
    public enum InputMode { RAW, USER_ENTERED }

    private final Sheets sheets;
    private final String spreadsheetId;

    GoogleSheetsClient(Sheets sheets, String spreadsheetId) {
        this.sheets = sheets;
        this.spreadsheetId = spreadsheetId;
    }

    public void testReadWrite() {
        execute(() -> sheets.spreadsheets().get(spreadsheetId)
                .setFields("spreadsheetId,properties.title").execute());
        batchUpdate(List.of());
    }

    public List<List<String>> readRows(String range) {
        var result = execute(() -> sheets.spreadsheets().values().get(spreadsheetId, range).execute());
        if (result.getValues() == null) return List.of();
        return result.getValues().stream()
                .map(row -> row.stream().map(cell -> Objects.toString(cell, "null")).toList()).toList();
    }

    public List<SheetProperties> properties() {
        var result = execute(() -> sheets.spreadsheets().get(spreadsheetId).setFields("sheets.properties").execute());
        return result.getSheets() == null ? List.of() : result.getSheets().stream().map(Sheet::getProperties).toList();
    }

    public SheetProperties requireSheet(String name) {
        return properties().stream().filter(p -> name.equals(p.getTitle())).findFirst()
                .orElseThrow(() -> SheetsErrors.unavailable("Не удалось найти лист " + name, null));
    }

    public void ensureSheet(String name) {
        if (properties().stream().noneMatch(p -> name.equals(p.getTitle()))) {
            batchUpdate(List.of(new Request().setAddSheet(new AddSheetRequest()
                    .setProperties(new SheetProperties().setTitle(name)))));
        }
    }

    public void batchUpdate(List<Request> requests) {
        execute(() -> sheets.spreadsheets().batchUpdate(spreadsheetId,
                new BatchUpdateSpreadsheetRequest().setRequests(requests)).execute());
    }

    public void clear(String range) {
        execute(() -> sheets.spreadsheets().values().clear(spreadsheetId, range, new ClearValuesRequest()).execute());
    }

    public void append(String range, List<List<Object>> rows) {
        execute(() -> sheets.spreadsheets().values().append(spreadsheetId, range, values(range, rows))
                .setValueInputOption(InputMode.USER_ENTERED.name()).setInsertDataOption("INSERT_ROWS").execute());
    }

    public void write(String range, List<List<Object>> rows, InputMode mode) {
        execute(() -> sheets.spreadsheets().values().update(spreadsheetId, range, values(range, rows))
                .setValueInputOption(mode.name()).execute());
    }

    public void writeBatch(List<ValueRange> ranges, InputMode mode) {
        execute(() -> sheets.spreadsheets().values().batchUpdate(spreadsheetId,
                new BatchUpdateValuesRequest().setValueInputOption(mode.name()).setData(ranges)).execute());
    }

    public static ValueRange values(String range, List<List<Object>> rows) {
        return new ValueRange().setRange(range).setMajorDimension("ROWS").setValues(rows);
    }

    private <T> T execute(ApiCall<T> call) {
        try {
            return call.run();
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (HttpResponseException ex) {
            throw SheetsErrors.unavailable("Google Sheets API ответил HTTP " + ex.getStatusCode() + ": " + ex.getContent(), ex);
        } catch (IOException ex) {
            throw SheetsErrors.unavailable("Google Sheets API недоступен", ex);
        } catch (RuntimeException ex) {
            throw SheetsErrors.unavailable("Не удалось обработать данные Google Sheets", ex);
        }
    }

    @FunctionalInterface
    private interface ApiCall<T> {
        T run() throws IOException;
    }
}
