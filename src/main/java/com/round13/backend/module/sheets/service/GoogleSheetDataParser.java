package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.TrainingType;
import org.springframework.stereotype.Component;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Component
public class GoogleSheetDataParser {
    public record PersonRow(String name, String phone, Boolean verified, String scheduleSheet, String userId) {
        public boolean managed() { return !userId.isBlank(); }
    }
    public record TrainingRow(String title, TrainingType type, String sourceType, OffsetDateTime startTime,
                              String schedule, int durationMinutes, String location, boolean active) {}

    public List<PersonRow> people(List<List<String>> values) {
        if (values.isEmpty()) return List.of();
        Header header = new Header(values.getFirst());
        List<PersonRow> result = new ArrayList<>();
        for (int index = 1; index < values.size(); index++) {
            Row row = new Row(header, values.get(index));
            if (no(row.value("активен", "active"))) continue;
            String phone = row.value("телефон", "phone", "номер телефона");
            String userId = row.value("round13 id", "user id", "user_id");
            if (phone.isBlank() && userId.isBlank()) continue;
            String fullName = java.util.stream.Stream.of(row.value("фамилия", "surname"),
                            row.value("имя", "first name"), row.value("отчество", "patronymic"))
                    .filter(value -> !value.isBlank()).collect(java.util.stream.Collectors.joining(" "));
            if (fullName.isBlank()) fullName = row.value("фио", "тренер", "участник", "name");
            result.add(new PersonRow(fullName, phone,
                    verification(row.value("прошел верификацию", "верифицирован", "verified")),
                    row.value("личный лист", "лист расписания", "лист тренера", "schedule sheet", "ссылка на персональную вкладку"), userId));
        }
        return List.copyOf(result);
    }

    public List<TrainingRow> trainings(List<List<String>> values, ZoneId defaultZone) {
        if (values.isEmpty()) return List.of();
        Header header = new Header(values.getFirst());
        List<TrainingRow> result = new ArrayList<>();
        for (int index = 1; index < values.size(); index++) {
            Row row = new Row(header, values.get(index));
            String date = row.value("дата", "date");
            String time = row.value("время", "начало", "start", "start time");
            String sourceType = row.value("тип тренировки", "тип", "training type", "type");
            String title = row.value("название", "тренировка", "title");
            if (sourceType.isBlank() && title.isBlank()) continue;
            int duration = positiveInt(row.value("длительность", "длительность минут", "duration", "duration minutes"), 60);
            boolean active = !no(row.value("активна", "активно", "статус", "active", "status"));
            OffsetDateTime startTime = date.isBlank() || time.isBlank() ? null
                    : LocalDateTime.of(parseDate(date), parseTime(time)).atZone(defaultZone).toOffsetDateTime();
            result.add(new TrainingRow(title.isBlank() ? sourceType : title, type(sourceType), sourceType,
                    startTime, row.value("расписание", "дни недели", "день недели", "schedule", "weekdays"), duration,
                    row.value("место", "зал", "локация", "location"), active));
        }
        return List.copyOf(result);
    }

    private LocalDate parseDate(String value) {
        for (DateTimeFormatter format : List.of(DateTimeFormatter.ISO_LOCAL_DATE, DateTimeFormatter.ofPattern("d.M.uuuu"),
                DateTimeFormatter.ofPattern("d/M/uuuu"))) try { return LocalDate.parse(value.trim(), format); }
        catch (DateTimeParseException ignored) { }
        throw new IllegalArgumentException("Некорректная дата тренировки: " + value);
    }
    private LocalTime parseTime(String value) {
        for (DateTimeFormatter format : List.of(DateTimeFormatter.ofPattern("H:mm"), DateTimeFormatter.ofPattern("H:mm:ss")))
            try { return LocalTime.parse(value.trim(), format); } catch (DateTimeParseException ignored) { }
        throw new IllegalArgumentException("Некорректное время тренировки: " + value);
    }
    private TrainingType type(String value) {
        String normalized = normalize(value);
        return normalized.contains("персон") || normalized.contains("personal") || normalized.contains("split")
                || normalized.contains("сплит") ? TrainingType.PERSONAL : TrainingType.GROUP;
    }
    private Boolean verification(String value) { return yes(value) ? Boolean.TRUE : no(value) ? Boolean.FALSE : null; }
    private boolean yes(String value) { return Set.of("да", "yes", "true", "1").contains(normalize(value)); }
    private boolean no(String value) { return Set.of("нет", "no", "false", "0", "неактивна", "inactive", "отменена").contains(normalize(value)); }
    private int positiveInt(String value, int fallback) { try { int parsed=Integer.parseInt(value.trim().replaceAll("\\D.*", "")); return parsed > 0 ? parsed : fallback; } catch (RuntimeException ex) { return fallback; } }
    private static String normalize(String value) { return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replace('ё','е').replaceAll("\\s+", " "); }

    private record Header(Map<String,Integer> indexes) {
        Header(List<String> cells) { this(index(cells)); }
        private static Map<String,Integer> index(List<String> cells) { Map<String,Integer> result=new HashMap<>(); for(int i=0;i<cells.size();i++) result.put(normalize(cells.get(i)),i); return result; }
    }
    private record Row(Header header, List<String> cells) {
        String value(String... aliases) { for(String alias:aliases) { Integer i=header.indexes().get(normalize(alias)); if(i!=null && i<cells.size()) return cells.get(i).trim(); } return ""; }
    }
}
