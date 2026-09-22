package com.round13.backend.module.sheets.service;

import com.round13.backend.module.sheets.model.TrainerSheet.AttendanceDate;
import com.round13.backend.module.sheets.model.TrainerSheet.Student;
import com.round13.backend.module.sheets.model.TrainerSheet.SessionDate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** Reads two-row date headers and student rows, preserving their physical order. */
final class TrainerDetailTableParser {
    private static final List<DateTimeFormatter> DATES = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("d.M.uuuu").withResolverStyle(ResolverStyle.STRICT),
            DateTimeFormatter.ofPattern("d/M/uuuu").withResolverStyle(ResolverStyle.STRICT));
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("H:mm[:ss]")
            .withResolverStyle(ResolverStyle.STRICT);

    record Detail(List<Student> students, List<SessionDate> dates) {}

    Detail parse(TrainerSheetGrid grid, int anchor, int end) {
        int header = anchor + 1;
        if (header + 1 >= end) throw grid.error(anchor, 0, "Нет двух строк заголовка детальной таблицы");
        int fullName = grid.column(header, "фио");
        int nickname = grid.column(header, "никнейм", "ник");
        int displayName = grid.column(header, "ученик", "имя");
        if (fullName < 0 && nickname < 0 && displayName < 0) {
            throw grid.error(header, 0, "Нет колонки ученика (ФИО, Никнейм или Ученик)");
        }
        List<DateColumns> dates = dateColumns(grid, header);
        List<Student> students = new ArrayList<>();
        for (int row = header + 2; row < end; row++) {
            String name = grid.cell(row, fullName);
            if (name.isBlank()) name = grid.cell(row, nickname);
            if (name.isBlank()) name = grid.cell(row, displayName);
            boolean hasStatuses = false;
            List<AttendanceDate> attendance = new ArrayList<>();
            for (DateColumns date : dates) {
                String paid = grid.cell(row, date.column());
                String attended = grid.cell(row, date.column() + 1);
                hasStatuses |= !paid.isBlank() || !attended.isBlank();
                if (date.date() == null) {
                    if (!paid.isBlank() || !attended.isBlank()) {
                        throw grid.error(row, date.column(), "Статус указан в колонке без даты");
                    }
                    continue;
                }
                attendance.add(new AttendanceDate(date.date(), date.time(),
                        booleanValue(grid, row, date.column()), booleanValue(grid, row, date.column() + 1)));
            }
            if (name.isBlank()) {
                if (hasStatuses) throw grid.error(row, 0, "Статусы указаны без имени ученика");
                continue;
            }
            students.add(new Student(name, attendance, row + 1));
        }
        return new Detail(List.copyOf(students), dates.stream().filter(d -> d.date() != null)
                .map(d -> new SessionDate(d.date(), d.time())).toList());
    }

    private List<DateColumns> dateColumns(TrainerSheetGrid grid, int header) {
        int width = Math.max(grid.rows().get(header).size(), grid.rows().get(header + 1).size());
        List<DateColumns> dates = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (int column = 0; column < width; column++) {
            String field = TrainerSheetGrid.normalized(grid.cell(header + 1, column));
            if (!field.equals("оплатил")) {
                if (field.equals("посетил")) throw grid.error(header + 1, column, "Посетил без парной колонки Оплатил");
                // A date must never disappear merely because its status headers were removed.
                String upper = grid.cell(header, column);
                if (upper.matches("[0-9].*[./-].*")) {
                    throw grid.error(header, column, "У даты нет пары Оплатил / Посетил");
                }
                continue;
            }
            if (!TrainerSheetGrid.normalized(grid.cell(header + 1, column + 1)).equals("посетил")) {
                throw grid.error(header + 1, column, "Ожидается пара Оплатил / Посетил");
            }
            String value = grid.cell(header, column);
            String repeated = grid.cell(header, column + 1);
            if (!repeated.isBlank() && !repeated.equals(value)) {
                throw grid.error(header, column + 1, "Разные даты в одной паре колонок");
            }
            DateColumns date = parseDate(grid, header, column, value);
            if (date.date() != null && !seen.add(date.date() + "/" + date.time())) {
                throw grid.error(header, column, "Повторная дата тренировки");
            }
            dates.add(date);
            column++;
        }
        if (dates.isEmpty()) throw grid.error(header + 1, 0, "Нет пар Оплатил / Посетил");
        return List.copyOf(dates);
    }

    private DateColumns parseDate(TrainerSheetGrid grid, int row, int col, String value) {
        if (value.isBlank()) return new DateColumns(col, null, null);
        String[] parts = value.replace('T', ' ').split("\\s+", -1);
        if (parts.length > 2) throw grid.error(row, col, "Некорректная дата: " + value);
        LocalDate date = null;
        for (DateTimeFormatter format : DATES) {
            try { date = LocalDate.parse(parts[0], format); break; }
            catch (DateTimeParseException ignored) { }
        }
        if (date == null) throw grid.error(row, col, "Некорректная дата: " + value);
        try {
            return new DateColumns(col, date, parts.length == 2 ? LocalTime.parse(parts[1], TIME) : null);
        } catch (DateTimeParseException ex) {
            throw grid.error(row, col, "Некорректное время: " + value);
        }
    }

    /** Empty dropdown/checkbox cells mean false; unrecognized nonempty values are errors. */
    private boolean booleanValue(TrainerSheetGrid grid, int row, int col) {
        return switch (TrainerSheetGrid.normalized(grid.cell(row, col))) {
            case "да", "true", "yes", "1" -> true;
            case "", "нет", "false", "no", "0" -> false;
            default -> throw grid.error(row, col, "Ожидается boolean (Да/Нет, TRUE/FALSE или 1/0)");
        };
    }

    private record DateColumns(int column, LocalDate date, LocalTime time) {}
}
