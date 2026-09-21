package com.round13.backend.module.sheets.service;

import java.util.*;

/** Complete DB-owned participant snapshot. Existing trainer choices are recovered by UUID only. */
final class ParticipantSheetPlan {
    static final String SHEET = "Участники";
    static final String LOOKUP = "Справочник тренеров";
    static final List<String> HEADERS = List.of("user_id", "ФИО", "Ник", "Телефон", "Активен", "Тренер",
            "trainer_user_id", "sync_status", "synced_at", "Фамилия", "Имя", "Отчество");
    record Result(List<List<Object>> participants, List<List<Object>> trainers, int added) {}

    static Result build(List<PersonSheetPlan.Person> participants, List<PersonSheetPlan.Person> trainers,
                        List<List<String>> previous, Map<UUID, UUID> primaryTrainers, String syncedAt) {
        Map<UUID, PersonSheetPlan.Person> trainerById = new HashMap<>();
        trainers.forEach(t -> trainerById.put(t.id(), t));
        Map<UUID, UUID> oldChoices = oldChoices(previous, trainerById.keySet());
        Set<UUID> oldIds = oldIds(previous);
        List<List<Object>> participantRows = new ArrayList<>();
        participantRows.add(new ArrayList<>(HEADERS));
        List<List<Object>> trainerRows = new ArrayList<>();
        trainerRows.add(List.of("Тренер", "trainer_user_id"));
        Map<UUID, String> labels = labels(trainers);
        labels.entrySet().stream().sorted(Map.Entry.comparingByValue()).forEach(e ->
                trainerRows.add(List.of(e.getValue(), e.getKey().toString())));
        int added = 0;
        Set<String> phones = new HashSet<>(), nicknames = new HashSet<>();
        for (var p : participants.stream().sorted(Comparator.comparing(PersonSheetPlan.Person::id)).toList()) {
            if (!unique(phones, p.phone(), false) || !unique(nicknames, p.nickname(), false)) continue;
            unique(phones, p.phone(), true); unique(nicknames, p.nickname(), true);
            UUID trainerId = oldChoices.getOrDefault(p.id(), primaryTrainers.get(p.id()));
            String trainer = trainerId == null ? "" : labels.getOrDefault(trainerId, "");
            int row = participantRows.size() + 1;
            participantRows.add(Arrays.asList(p.id().toString(), safe(p.name()), safe(p.nickname()), safe(p.phone()),
                    p.active() ? "Да" : "Нет", trainer, "=IFERROR(VLOOKUP(F" + row + ",'" + LOOKUP + "'!A:B,2,FALSE),\"\")",
                    p.active() ? "Синхронизирован" : "Неактивен в БД", syncedAt, safe(p.surname()), safe(p.firstName()), safe(p.patronymic())));
            if (!oldIds.contains(p.id())) added++;
        }
        return new Result(participantRows, trainerRows, added);
    }

    private static Map<UUID, String> labels(List<PersonSheetPlan.Person> trainers) {
        Map<String, Long> counts = new HashMap<>();
        for (var t : trainers) counts.merge(display(t), 1L, Long::sum);
        Map<UUID, String> result = new HashMap<>();
        for (var t : trainers) result.put(t.id(), counts.get(display(t)) > 1
                ? display(t) + " [" + t.id() + "]" : display(t));
        return result;
    }
    private static String display(PersonSheetPlan.Person p) {
        String fio = String.join(" ", List.of(safe(p.surname()), safe(p.firstName()), safe(p.patronymic()))).trim();
        return !fio.isBlank() ? fio : !safe(p.nickname()).isBlank() ? p.nickname() : p.id().toString();
    }
    private static String safe(String s) { return s == null ? "" : s; }
    private static boolean unique(Set<String> seen, String value, boolean add) {
        return value == null || value.isBlank() || (add ? seen.add(value.trim().toLowerCase(Locale.ROOT))
                : !seen.contains(value.trim().toLowerCase(Locale.ROOT)));
    }
    private static Set<UUID> oldIds(List<List<String>> rows) {
        int col = column(rows, "user_id"); Set<UUID> ids = new HashSet<>();
        for (int i = 1; i < rows.size(); i++) id(cell(rows.get(i), col)).ifPresent(ids::add);
        return ids;
    }
    private static Map<UUID, UUID> oldChoices(List<List<String>> rows, Set<UUID> validTrainers) {
        int userCol = column(rows, "user_id"), trainerCol = column(rows, "trainer_user_id");
        Map<UUID, UUID> choices = new HashMap<>();
        for (int i = 1; i < rows.size(); i++) {
            var user = id(cell(rows.get(i), userCol)); var trainer = id(cell(rows.get(i), trainerCol));
            if (user.isPresent() && trainer.isPresent() && validTrainers.contains(trainer.get()))
                choices.putIfAbsent(user.get(), trainer.get());
        }
        return choices;
    }
    private static int column(List<List<String>> rows, String name) {
        if (rows.isEmpty()) return -1;
        for (int i = 0; i < rows.getFirst().size(); i++) if (name.equalsIgnoreCase(rows.getFirst().get(i).trim())) return i;
        return -1;
    }
    private static String cell(List<String> row, int col) { return col < 0 || col >= row.size() ? "" : row.get(col); }
    private static Optional<UUID> id(String raw) {
        try { return Optional.of(UUID.fromString(raw.trim())); } catch (RuntimeException e) { return Optional.empty(); }
    }
}
