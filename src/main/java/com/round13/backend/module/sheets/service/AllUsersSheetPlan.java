package com.round13.backend.module.sheets.service;

import java.util.*;

/** Complete application-owned snapshot. UUID identity, deterministic order, no stale rows. */
public final class AllUsersSheetPlan {
    public static final String TITLE = "Все пользователи";
    public static final List<String> HEADERS = List.of("№", "user_id", "Фамилия", "Имя", "Отчество",
            "Отображаемое имя", "Ник", "Телефон", "Роль", "Тренер", "Админ", "Статус",
            "Профиль заполнен / верификация профиля", "Telegram user id", "Личный тренер / связанные тренеры",
            "sync_status", "synced_at");

    private AllUsersSheetPlan() {}

    public static GoogleSheetsGateway.ValueUpdate reconcile(Map<UUID, List<Object>> users,
                                                            List<List<String>> previous) {
        int width = Math.max(HEADERS.size(), previous.stream().mapToInt(List::size).max().orElse(0));
        List<List<Object>> rows = new ArrayList<>();
        rows.add(pad(new ArrayList<>(HEADERS), width));
        users.entrySet().stream().sorted(Map.Entry.comparingByKey(Comparator.comparing(UUID::toString)))
                .forEach(entry -> {
                    List<Object> row = new ArrayList<>();
                    row.add(rows.size());
                    row.add(entry.getKey().toString());
                    row.addAll(entry.getValue());
                    rows.add(pad(row, width));
                });
        while (rows.size() < previous.size()) rows.add(pad(new ArrayList<>(), width));
        return new GoogleSheetsGateway.ValueUpdate("'" + TITLE + "'!A1", rows);
    }

    private static List<Object> pad(List<Object> row, int width) {
        while (row.size() < width) row.add("");
        return row;
    }
}
