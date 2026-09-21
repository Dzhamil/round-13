package com.round13.backend.module.sheets.integration;

import java.util.Arrays;
import java.util.List;

/** Persisted participant layout. Column order is part of the spreadsheet contract. */
public final class ParticipantSheetSchema {
    public static final String SHEET = "Участники";
    public static final String TRAINER_LOOKUP = "Справочник тренеров";
    public static final int HEADER_ROWS = 1;
    public static final int FIRST_DATA_ROW = HEADER_ROWS + 1;
    public static final List<String> TRAINER_HEADERS = List.of("Тренер", "trainer_user_id");

    public enum Column {
        USER_ID("user_id", "A"), NAME("ФИО", "B"), NICKNAME("Ник", "C"), PHONE("Телефон", "D"),
        ACTIVE("Активен", "E"), TRAINER("Тренер", "F"), TRAINER_USER_ID("trainer_user_id", "G"),
        SYNC_STATUS("sync_status", "H"), SYNCED_AT("synced_at", "I"), SURNAME("Фамилия", "J"),
        FIRST_NAME("Имя", "K"), PATRONYMIC("Отчество", "L");

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

    public static String trainerFormulaOrigin() {
        return SheetRanges.range(SHEET, Column.TRAINER_USER_ID.a1() + FIRST_DATA_ROW);
    }

    public static String trainerLookupFormula(int row) {
        return "=IFERROR(VLOOKUP(" + Column.TRAINER.a1() + row + ","
                + SheetRanges.range(TRAINER_LOOKUP, "A:B") + ",2,FALSE),\"\")";
    }

    /** A header-only directory still needs a valid (empty) dropdown source. */
    public static String trainerDropdownSource(int lookupRows) {
        return "=" + SheetRanges.range(TRAINER_LOOKUP, "$A$" + FIRST_DATA_ROW + ":$A"
                + Math.max(FIRST_DATA_ROW, lookupRows));
    }
}
