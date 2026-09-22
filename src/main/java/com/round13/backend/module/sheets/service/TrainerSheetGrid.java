package com.round13.backend.module.sheets.service;

import java.util.List;
import java.util.Locale;

/** Safe access to the ragged rows returned by the Sheets values API. */
record TrainerSheetGrid(String sheetName, List<List<String>> rows) {
    String cell(int row, int column) {
        if (row < 0 || row >= rows.size() || column < 0 || column >= rows.get(row).size()) return "";
        String value = rows.get(row).get(column);
        return value == null ? "" : value.trim();
    }

    int column(int row, String... names) {
        for (int col = 0; col < rows.get(row).size(); col++) {
            for (String name : names) if (normalized(cell(row, col)).equals(name)) return col;
        }
        return -1;
    }

    IllegalArgumentException error(int row, int col, String message) {
        return new IllegalArgumentException("Лист «" + sheetName + "», строка " + (row + 1)
                + ", столбец " + (col + 1) + ": " + message);
    }

    static String normalized(String value) {
        return value.trim().toLowerCase(Locale.ROOT).replace('ё', 'е').replace('\u00a0', ' ').replaceAll("\\s+", " ");
    }
}
