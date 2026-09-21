package com.round13.backend.module.sheets.service;

import java.util.*;

import com.round13.backend.module.sheets.integration.ParticipantSheetSchema;

/** Complete DB-owned participant snapshot. Existing trainer choices prefer UUID, with exact directory-label recovery for broken legacy formulas. */
final class ParticipantSheetPlan {
    static final List<String> HEADERS = ParticipantSheetSchema.HEADERS;
    record Result(List<List<Object>> participants, List<List<Object>> trainers, int added) {}

    static Result build(List<PersonSheetPlan.Person> participants, List<PersonSheetPlan.Person> trainers,
                        List<List<String>> previous, Map<UUID, UUID> primaryTrainers, String syncedAt) {
        Map<UUID, PersonSheetPlan.Person> trainerById = new HashMap<>();
        trainers.forEach(t -> trainerById.put(t.id(), t));
        Map<UUID, String> labels = labels(trainers);
        Map<UUID, UUID> oldChoices = oldChoices(previous, trainerById.keySet(), labels);
        Set<UUID> oldIds = oldIds(previous);
        List<List<Object>> participantRows = new ArrayList<>();
        participantRows.add(new ArrayList<>(HEADERS));
        List<List<Object>> trainerRows = new ArrayList<>();
        trainerRows.add(new ArrayList<>(ParticipantSheetSchema.TRAINER_HEADERS));
        labels.entrySet().stream().sorted(Map.Entry.comparingByValue()).forEach(e ->
                trainerRows.add(List.of(e.getValue(), e.getKey().toString())));
        int added = 0;
        Set<UUID> participantIds = new HashSet<>();
        Set<String> phones = new HashSet<>(), nicknames = new HashSet<>();
        for (var p : participants.stream().sorted(Comparator.comparing(PersonSheetPlan.Person::id)).toList()) {
            if (!p.active() || safe(p.phone()).isBlank() || safe(p.surname()).isBlank()
                    || safe(p.firstName()).isBlank() || safe(p.patronymic()).isBlank()) continue;
            if (!participantIds.add(p.id()) || !unique(phones, p.phone(), false)
                    || !unique(nicknames, p.nickname(), false)) continue;
            unique(phones, p.phone(), true); unique(nicknames, p.nickname(), true);
            UUID trainerId = oldChoices.getOrDefault(p.id(), primaryTrainers.get(p.id()));
            String trainer = trainerId == null ? "" : labels.getOrDefault(trainerId, "");
            participantRows.add(Arrays.asList(safe(p.surname()), safe(p.firstName()), safe(p.patronymic()),
                    safe(p.nickname()), safe(p.phone()), p.active() ? "Да" : "Нет", trainer,
                    p.id().toString(), "", p.active() ? "Синхронизирован" : "Неактивен в БД", syncedAt));
            if (!oldIds.contains(p.id())) added++;
        }
        return new Result(participantRows, trainerRows, added);
    }

    private static Map<UUID, String> labels(List<PersonSheetPlan.Person> trainers) {
        Map<String, Long> counts = new HashMap<>();
        for (var t : trainers) counts.merge(display(t).toLowerCase(Locale.ROOT), 1L, Long::sum);
        Map<UUID, String> result = new HashMap<>();
        for (var t : trainers) result.put(t.id(), counts.get(display(t).toLowerCase(Locale.ROOT)) > 1
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
        int col = column(rows, ParticipantSheetSchema.Column.USER_ID.header()); Set<UUID> ids = new HashSet<>();
        for (int i = 1; i < rows.size(); i++) id(cell(rows.get(i), col)).ifPresent(ids::add);
        return ids;
    }
    private static Map<UUID, UUID> oldChoices(List<List<String>> rows, Set<UUID> validTrainers, Map<UUID, String> labels) {
        int userCol = column(rows, ParticipantSheetSchema.Column.USER_ID.header());
        int trainerCol = column(rows, ParticipantSheetSchema.Column.TRAINER_USER_ID.header());
        int labelCol = column(rows, ParticipantSheetSchema.Column.TRAINER.header());
        Map<String, UUID> idsByLabel = new HashMap<>();
        labels.forEach((id, label) -> idsByLabel.put(label, id));
        Map<UUID, UUID> choices = new HashMap<>();
        for (int i = 1; i < rows.size(); i++) {
            var user = id(cell(rows.get(i), userCol)); var trainer = id(cell(rows.get(i), trainerCol));
            if (trainer.isEmpty()) trainer = Optional.ofNullable(idsByLabel.get(cell(rows.get(i), labelCol)));
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
