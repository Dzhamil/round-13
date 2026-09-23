package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/** Writes only personal-sheet attendance cells; delivery state belongs to Schedule2. */
@Service
@RequiredArgsConstructor
@Slf4j
public class Schedule2AttendanceSheetWriter {
    private final GoogleSheetSpaceRepository repository;
    private final GoogleSheetsGateway gateway;
    private final GoogleSheetDataParser parser;
    private final TrainerSheetUserResolver users;
    private final AttendanceSheetUpdatePlan planner;

    public boolean sync(TrainingSessionEntity training, List<TrainingParticipantEntity> participants, UUID markedBy) {
        if (training.getSheetImportSpreadsheetId() == null) return false;
        try {
            write(training, participants);
            return true;
        } catch (RuntimeException ex) {
            log.error("Attendance writeback failed; DB attendance retained: spreadsheet={} trainer={} training={} sourceTraining={} date={} students={} reason={}",
                    training.getSheetImportSpreadsheetId(), training.getCoach().getId(), training.getId(),
                    training.getSheetImportTrainingId(), training.getSheetImportDate(),
                    participants.stream().map(p -> p.getUser().getId()).toList(), ex.getMessage(), ex);
            return false;
        }
    }

    private void write(TrainingSessionEntity training, List<TrainingParticipantEntity> participants) {
        var space = repository.findByActiveTrue().orElseThrow(() -> new IllegalArgumentException("Нет активного Google Sheets пространства"));
        if (!Objects.equals(space.getSpreadsheetId(), training.getSheetImportSpreadsheetId())) {
            throw new IllegalArgumentException("Исходная Google-таблица больше не активна");
        }
        var directory = users.load();
        var trainers = parser.activeTrainers(gateway.readRows(space, "'Тренеры'!A:Z"));
        var matches = trainers.stream().filter(row -> {
            // An unrelated malformed trainer must not redirect or prevent the intended trainer's writeback.
            try { return directory.trainer(row).getId().equals(training.getCoach().getId()); }
            catch (IllegalArgumentException ex) { return false; }
        }).toList();
        if (matches.size() != 1) throw new IllegalArgumentException("Не найдена однозначная активная строка тренера");
        var trainer = matches.getFirst();
        String title = trainer.scheduleSheet().isBlank() ? trainer.name() : trainer.scheduleSheet();
        var gid = TrainerSheetReference.sheetId(title, space.getSpreadsheetId());
        if (gid.isPresent()) title = gateway.sheetTitleById(space, gid.getAsInt());
        if (title.isBlank()) throw new IllegalArgumentException("Не найдена личная вкладка тренера");
        var rows = gateway.readRows(space, "'" + title.replace("'", "''") + "'");
        var sheet = parser.trainerSheet(trainer.name(), title, rows);
        var updates = planner.plan(training, participants, sheet, directory);
        if (!updates.isEmpty()) gateway.updateValues(space, updates);
    }
}
