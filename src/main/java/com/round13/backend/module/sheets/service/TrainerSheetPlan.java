package com.round13.backend.module.sheets.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

/** Reconciles identities only by UUID; unmanaged cells and physical rows are never removed. */
public final class TrainerSheetPlan {
    public record Trainer(UUID id, String name, String nickname, String phone, boolean active) {}
    public record Result(List<GoogleSheetsGateway.ValueUpdate> updates, int active, int inactive,
                         int added, int unmatched, int duplicates) {}
    private static final List<List<String>> COLUMNS = List.of(
            List.of("user_id"), List.of("ФИО", "имя", "тренер", "name"),
            List.of("Ник", "nickname", "никнейм"), List.of("Телефон", "phone", "номер телефона"),
            List.of("Активен", "active", "активный", "активность"),
            List.of("Личный лист", "лист расписания", "лист тренера", "schedule sheet"),
            List.of("sync_status"), List.of("synced_at"));
    private final List<List<String>> rows;
    private final List<String> header;
    private final int[] columns = new int[COLUMNS.size()];
    private final List<GoogleSheetsGateway.ValueUpdate> updates = new ArrayList<>();

    public TrainerSheetPlan(List<List<String>> rows) {
        this.rows = rows;
        header = new ArrayList<>(rows.isEmpty() ? List.of() : rows.getFirst());
        // Preserve headerless trailing columns that may contain manually maintained data.
        int width = rows.stream().mapToInt(List::size).max().orElse(0);
        while (header.size() < width) header.add("");
        for (int field = 0; field < COLUMNS.size(); field++) {
            List<String> aliases = COLUMNS.get(field);
            List<Integer> matches = new ArrayList<>();
            for (int col = 0; col < header.size(); col++) {
                String label = header.get(col).trim().toLowerCase(Locale.ROOT);
                if (aliases.stream().anyMatch(alias -> alias.toLowerCase(Locale.ROOT).equals(label))) matches.add(col);
            }
            if (matches.size() > 1) throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Неоднозначные колонки вкладки Тренеры: " + aliases.getFirst());
            columns[field] = matches.isEmpty() ? header.size() : matches.getFirst();
            if (matches.isEmpty()) header.add(aliases.getFirst());
        }
        if (header.size() > 702) throw new ResponseStatusException(HttpStatus.CONFLICT, "Слишком много колонок во вкладке Тренеры");
    }

    public Set<UUID> existingIds() {
        Set<UUID> result = new HashSet<>();
        for (int row = 1; row < rows.size(); row++) parseId(value(row, 0)).ifPresent(result::add);
        return result;
    }

    public Result reconcile(List<Trainer> trainers, String syncedAt) {
        Map<UUID, Trainer> byId = new LinkedHashMap<>();
        trainers.stream().sorted(Comparator.comparing(Trainer::id)).forEach(t -> byId.put(t.id(), t));
        updates.add(new GoogleSheetsGateway.ValueUpdate("'Тренеры'!A1", List.of(new ArrayList<>(header))));
        Set<UUID> seen = new HashSet<>();
        int active = 0, inactive = 0, unmatched = 0, duplicates = 0, added = 0;
        for (int row = 1; row < rows.size(); row++) {
            if (rows.get(row).stream().allMatch(String::isBlank)) continue;
            UUID id = parseId(value(row, 0)).orElse(null);
            Trainer trainer = byId.get(id);
            boolean duplicate = id != null && !seen.add(id);
            boolean enabled = trainer != null && trainer.active() && !duplicate;
            if (trainer != null && !duplicate) writeIdentity(row, trainer);
            write(row, 4, enabled ? "Да" : "Нет");
            write(row, 6, duplicate ? "Дубликат user_id" : trainer == null ? "Нет пользователя БД" : enabled ? "Синхронизирован" : "Неактивен в БД");
            write(row, 7, syncedAt);
            if (enabled) active++; else inactive++;
            if (trainer == null) unmatched++;
            if (duplicate) duplicates++;
        }
        int nextRow = Math.max(1, rows.size());
        for (Trainer trainer : byId.values()) {
            if (!trainer.active() || seen.contains(trainer.id())) continue;
            writeIdentity(nextRow, trainer);
            write(nextRow, 4, "Да");
            write(nextRow, 6, "Синхронизирован");
            write(nextRow++, 7, syncedAt);
            added++; active++;
        }
        return new Result(List.copyOf(updates), active, inactive, added, unmatched, duplicates);
    }

    private void writeIdentity(int row, Trainer trainer) {
        write(row, 0, trainer.id().toString());
        write(row, 1, trainer.name());
        write(row, 2, trainer.nickname());
        write(row, 3, trainer.phone());
    }

    private void write(int row, int field, String value) {
        updates.add(new GoogleSheetsGateway.ValueUpdate("'Тренеры'!" + columnName(columns[field]) + (row + 1),
                List.of(List.of(value == null ? "" : value))));
    }

    private String value(int row, int field) {
        return columns[field] < rows.get(row).size() ? rows.get(row).get(columns[field]).trim() : "";
    }

    private static Optional<UUID> parseId(String value) {
        try {
            UUID id = UUID.fromString(value);
            return id.toString().equalsIgnoreCase(value) ? Optional.of(id) : Optional.empty();
        } catch (IllegalArgumentException ex) { return Optional.empty(); }
    }

    private static String columnName(int index) {
        StringBuilder name = new StringBuilder();
        for (int n = index + 1; n > 0; n = (n - 1) / 26) name.append((char) ('A' + (n - 1) % 26));
        return name.reverse().toString();
    }
}
