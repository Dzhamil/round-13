package com.round13.backend.module.sheets.sync;

import java.util.*;

/** Header aliases shared by legacy sheet adoption and roster export. */
final class CoachSheetColumns {
    static final Map<String, List<String>> FIELDS = new LinkedHashMap<>();
    static {
        FIELDS.put("userId", List.of("Round13 ID", "user id", "user_id"));
        FIELDS.put("phone", List.of("Телефон", "phone", "номер телефона"));
        FIELDS.put("name", List.of("ФИО", "name", "тренер", "участник"));
        FIELDS.put("surname", List.of("Фамилия", "surname"));
        FIELDS.put("firstName", List.of("Имя", "first name"));
        FIELDS.put("patronymic", List.of("Отчество", "patronymic"));
        FIELDS.put("nickname", List.of("Ник", "nickname"));
        FIELDS.put("role", List.of("Роль", "role"));
        FIELDS.put("active", List.of("Активен", "active"));
        FIELDS.put("schedule", List.of("Лист расписания", "личный лист", "лист тренера",
                "schedule sheet", "ссылка на персональную вкладку"));
    }
    private final List<String> headers;
    private final Map<String, Integer> columns = new HashMap<>();

    CoachSheetColumns(List<String> existing) {
        headers = new ArrayList<>(existing);
        FIELDS.forEach((field, aliases) -> {
            List<Integer> matches = new ArrayList<>();
            for (int i = 0; i < headers.size(); i++) {
                String header = normalize(headers.get(i));
                if (aliases.stream().map(CoachSheetColumns::normalize).anyMatch(header::equals)) matches.add(i);
            }
            if (matches.size() > 1) throw new IllegalStateException("Ambiguous coach sheet column: " + field);
            int index = matches.isEmpty() ? headers.size() : matches.getFirst();
            if (matches.isEmpty()) headers.add(aliases.getFirst());
            columns.put(field, index);
        });
        if (headers.size() > 26) throw new IllegalStateException("Coach sheet exceeds supported A:Z schema");
    }

    List<String> headers() { return List.copyOf(headers); }
    int index(String field) { return columns.get(field); }
    String value(List<String> row, String field) {
        int index = index(field);
        return index < row.size() && row.get(index) != null ? row.get(index).trim() : "";
    }
    static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replace('ё', 'е').replaceAll("\\s+", " ");
    }
    static String cell(int row, int column) { return "'Тренеры'!" + (char) ('A' + column) + (row + 1); }
}
