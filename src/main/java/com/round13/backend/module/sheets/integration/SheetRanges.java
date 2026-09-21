package com.round13.backend.module.sheets.integration;

/** A1 notation only; URL encoding belongs to the API client. */
public final class SheetRanges {
    private SheetRanges() {}

    public static String quote(String sheet) {
        return "'" + sheet.replace("'", "''") + "'";
    }

    public static String range(String sheet, String cells) {
        return quote(sheet) + "!" + cells;
    }

    public static String origin(String sheet) {
        return range(sheet, "A1");
    }

    /** Preserve the existing export boundary, including clearing stale columns. */
    public static String exportColumns(String sheet) {
        return range(sheet, "A:Z");
    }
}
