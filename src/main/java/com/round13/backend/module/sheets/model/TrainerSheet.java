package com.round13.backend.module.sheets.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Read-only snapshot; sheet-local IDs are meaningful only together with sheetName. */
public record TrainerSheet(String trainerName, String sheetName, List<Training> trainings) {
    public TrainerSheet { trainings = List.copyOf(trainings); }

    public record SessionDate(LocalDate date, LocalTime time) {}

    public record Training(int trainingId, String type, String title, int durationMinutes, List<Student> students,
                           List<SessionDate> dates, int sourceRow) {
        public Training {
            students = List.copyOf(students);
            dates = List.copyOf(dates);
        }
        public Training(int id, String type, String title, int duration, List<Student> students) {
            this(id, type, title, duration, students, students.stream().flatMap(s -> s.dates().stream())
                    .map(d -> new SessionDate(d.date(), d.time())).distinct().toList(), 0);
        }
    }

    public record Student(String displayName, List<AttendanceDate> dates, int sourceRow) {
        public Student(String displayName, List<AttendanceDate> dates) { this(displayName, dates, 0); }
        public Student { dates = List.copyOf(dates); }
    }

    /** time is absent for a date-only header; no time or timezone is invented. */
    public record AttendanceDate(LocalDate date, LocalTime time, boolean paid, boolean attended) {}
}
