package com.round13.backend.module.sheets.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Read-only snapshot; sheet-local IDs are meaningful only together with sheetName. */
public record TrainerSheet(String trainerName, String sheetName, List<Training> trainings) {
    public TrainerSheet { trainings = List.copyOf(trainings); }

    public record Training(int trainingId, String type, String title, int durationMinutes, List<Student> students) {
        public Training { students = List.copyOf(students); }
    }

    public record Student(String displayName, List<AttendanceDate> dates) {
        public Student { dates = List.copyOf(dates); }
    }

    /** time is absent for a date-only header; no time or timezone is invented. */
    public record AttendanceDate(LocalDate date, LocalTime time, boolean paid, boolean attended) {}
}
