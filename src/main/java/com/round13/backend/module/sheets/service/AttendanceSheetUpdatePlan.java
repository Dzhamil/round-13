package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.sheets.model.TrainerSheet;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.*;

/** Validates every target before producing one batch of single-cell attendance updates. */
@Component
public class AttendanceSheetUpdatePlan {
    public List<GoogleSheetsGateway.ValueUpdate> plan(TrainingSessionEntity session,
            List<TrainingParticipantEntity> participants, TrainerSheet sheet, TrainerSheetUserResolver.Directory users) {
        var trainings = sheet.trainings().stream().filter(t -> Objects.equals(t.trainingId(), session.getSheetImportTrainingId())).toList();
        if (trainings.size() != 1) throw new IllegalArgumentException("Не найдена однозначная тренировка ID " + session.getSheetImportTrainingId());
        var training = trainings.getFirst();
        Map<UUID, TrainerSheet.Student> students = new HashMap<>();
        for (var student : training.students()) {
            UUID id = users.student(student.displayName()).getId();
            if (students.putIfAbsent(id, student) != null) throw new IllegalArgumentException("Повторный ученик " + id);
        }
        var dates = training.dates().stream().filter(d -> d.date().atTime(d.time() == null ? LocalTime.MIDNIGHT : d.time())
                .equals(session.getSheetImportDate())).toList();
        if (dates.size() != 1) throw new IllegalArgumentException("Не найдена однозначная дата " + session.getSheetImportDate());
        var date = dates.getFirst();
        List<GoogleSheetsGateway.ValueUpdate> updates = new ArrayList<>();
        Set<String> targets = new HashSet<>();
        for (var participant : participants) {
            var student = students.get(participant.getUser().getId());
            if (student == null) throw new IllegalArgumentException("Не найден ученик " + participant.getUser().getId());
            var cells = student.dates().stream().filter(d -> d.date().equals(date.date()) && Objects.equals(d.time(), date.time())).toList();
            if (cells.size() != 1 || student.sourceRow() < 1 || cells.getFirst().attendanceColumn() < 1) {
                throw new IllegalArgumentException("Не найдена ячейка Посетил ученика " + participant.getUser().getId());
            }
            String range = "'" + sheet.sheetName().replace("'", "''") + "'!" + column(cells.getFirst().attendanceColumn()) + student.sourceRow();
            if (!targets.add(range)) throw new IllegalArgumentException("Повторная целевая ячейка " + range);
            updates.add(new GoogleSheetsGateway.ValueUpdate(range, List.of(List.of(participant.getAttendanceStatus() == AttendanceStatus.PRESENT))));
        }
        return List.copyOf(updates);
    }

    private String column(int oneBased) {
        StringBuilder result = new StringBuilder();
        for (int n = oneBased; n > 0; n = (n - 1) / 26) result.append((char) ('A' + (n - 1) % 26));
        return result.reverse().toString();
    }
}
