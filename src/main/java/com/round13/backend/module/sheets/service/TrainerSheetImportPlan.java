package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.sheets.model.TrainerSheet;

import java.time.*;
import java.util.*;

/** Validates the entire snapshot before reconciliation can retire any existing records. */
record TrainerSheetImportPlan(List<Session> sessions) {
    record Key(int trainingId, LocalDateTime date) {}
    record Member(UserEntity user, AttendanceStatus attendance, boolean paid) {}
    record Session(Key key, String title, TrainingType type, int duration, List<Member> members) {}

    static TrainerSheetImportPlan from(TrainerSheet sheet, TrainerSheetUserResolver.Directory users) {
        List<Session> sessions = new ArrayList<>();
        Set<Key> keys = new HashSet<>();
        for (var training : sheet.trainings()) {
            String context = "Тренировка ID " + training.trainingId() + ", строка " + training.sourceRow() + ": ";
            if (training.title().isBlank() || training.title().length() > 256 || training.durationMinutes() <= 0) {
                throw new IllegalArgumentException(context + "Некорректные название или длительность");
            }
            TrainingType type = type(training.type(), context);
            Map<UUID, TrainerSheet.Student> students = new LinkedHashMap<>();
            Map<UUID, UserEntity> resolved = new HashMap<>();
            for (var student : training.students()) {
                UserEntity user;
                try { user = users.student(student.displayName()); }
                catch (IllegalArgumentException ex) {
                    throw new IllegalArgumentException(context + "строка ученика " + student.sourceRow() + ": " + ex.getMessage());
                }
                if (students.putIfAbsent(user.getId(), student) != null) {
                    throw new IllegalArgumentException(context + "Повторный ученик, строка " + student.sourceRow());
                }
                resolved.put(user.getId(), user);
            }
            for (var date : training.dates()) {
                var key = new Key(training.trainingId(), date.date().atTime(date.time() == null ? LocalTime.MIDNIGHT : date.time()));
                if (!keys.add(key)) throw new IllegalArgumentException(context + "Повторная дата " + key.date());
                List<Member> members = new ArrayList<>();
                for (var entry : students.entrySet()) {
                    var attendance = entry.getValue().dates().stream()
                            .filter(d -> d.date().equals(date.date()) && Objects.equals(d.time(), date.time())).toList();
                    if (attendance.size() != 1) throw new IllegalArgumentException(context + "Несогласованные даты ученика, строка " + entry.getValue().sourceRow());
                    members.add(new Member(resolved.get(entry.getKey()), attendance.getFirst().attended() ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT, attendance.getFirst().paid()));
                }
                sessions.add(new Session(key, training.title(), type, training.durationMinutes(), List.copyOf(members)));
            }
        }
        return new TrainerSheetImportPlan(List.copyOf(sessions));
    }

    private static TrainingType type(String value, String context) {
        return switch (TrainerSheetGrid.normalized(value)) {
            case "personal", "персональная", "персональная тренировка" -> TrainingType.PERSONAL;
            case "group", "групповая", "групповая тренировка", "сплит", "трио", "мини-группа", "мини группа" -> TrainingType.GROUP;
            case "open", "открытая", "открытая тренировка" -> TrainingType.OPEN;
            default -> throw new IllegalArgumentException(context + "Неизвестный тип тренировки: " + value);
        };
    }
}
