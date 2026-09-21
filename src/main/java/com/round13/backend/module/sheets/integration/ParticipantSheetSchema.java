package com.round13.backend.module.sheets.integration;

import java.text.DecimalFormatSymbols;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/** Persisted participant layout. Column order is part of the spreadsheet contract. */
public final class ParticipantSheetSchema {
    public static final String SHEET = "Участники";
    public static final String TRAINER_LOOKUP = "Справочник тренеров";
    public static final int HEADER_ROWS = 1;
    public static final int FIRST_DATA_ROW = HEADER_ROWS + 1;
    public static final List<String> TRAINER_HEADERS = List.of("Тренер", "trainer_user_id");

    public enum Column {
        SURNAME("Фамилия", "A"), FIRST_NAME("Имя", "B"), PATRONYMIC("Отчество", "C"),
        NICKNAME("Ник", "D"), PHONE("Телефон", "E"), ACTIVE("Активен", "F"), TRAINER("Тренер", "G"),
        USER_ID("user_id", "H"), TRAINER_USER_ID("trainer_user_id", "I"),
        SYNC_STATUS("Статус синхронизации", "J"), SYNCED_AT("Время синхронизации", "K");

        private final String header;
        private final String a1;

        Column(String header, String a1) {
            this.header = header;
            this.a1 = a1;
        }

        public String header() { return header; }
        public int index() { return ordinal(); }
        public String a1() { return a1; }
    }

    public static final List<String> HEADERS = Arrays.stream(Column.values()).map(Column::header).toList();

    private ParticipantSheetSchema() {}

    public static String previousSnapshotRange() {
        return SheetRanges.range(SHEET, "A:ZZ");
    }

    public static String snapshotRange() {
        return SheetRanges.range(SHEET, "A:" + Column.SYNCED_AT.a1());
    }

    public static String trainerFormulaOrigin() {
        return SheetRanges.range(SHEET, Column.TRAINER_USER_ID.a1() + FIRST_DATA_ROW);
    }

    public static String trainerLookupFormula(int row, String spreadsheetLocale) {
        // Sheets uses semicolons in decimal-comma locales (including ru_RU).
        Locale locale = Locale.forLanguageTag(spreadsheetLocale.replace('_', '-'));
        String separator = DecimalFormatSymbols.getInstance(locale).getDecimalSeparator() == ',' ? ";" : ",";
        String cell = Column.TRAINER.a1() + row;
        return "=IF(" + cell + "=\"\"" + separator + "\"\"" + separator
                + "XLOOKUP(" + cell + separator + SheetRanges.range(TRAINER_LOOKUP, "A2:A")
                + separator + SheetRanges.range(TRAINER_LOOKUP, "B2:B") + separator + "\"\"" + separator + "0))";
    }

    /** A header-only directory still needs a valid (empty) dropdown source. */
    public static String trainerDropdownSource(int lookupRows) {
        return "=" + SheetRanges.range(TRAINER_LOOKUP, "$A$" + FIRST_DATA_ROW + ":$A"
                + Math.max(FIRST_DATA_ROW, lookupRows));
    }
}
