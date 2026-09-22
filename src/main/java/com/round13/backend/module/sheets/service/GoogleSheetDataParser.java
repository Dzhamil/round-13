package com.round13.backend.module.sheets.service;

import com.round13.backend.module.sheets.model.TrainerSheet;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class GoogleSheetDataParser {
    private final TrainerSheetParser trainerSheetParser = new TrainerSheetParser();

    public record PersonRow(String name, String phone, boolean verified, String scheduleSheet, String userId) {
        public PersonRow(String name, String phone, boolean verified, String scheduleSheet) {
            this(name, phone, verified, scheduleSheet, "");
        }
    }

    public List<PersonRow> people(List<List<String>> values) {
        return people(values, false);
    }

    public List<PersonRow> activeTrainers(List<List<String>> values) {
        return people(values, true);
    }

    private List<PersonRow> people(List<List<String>> values, boolean activeOnly) {
        if (values.isEmpty()) return List.of();
        Header header = new Header(values.getFirst());
        List<PersonRow> result = new ArrayList<>();
        for (int index = 1; index < values.size(); index++) {
            Row row = new Row(header, values.get(index));
            if (activeOnly && no(row.value("активен", "active", "активный", "активность"))) continue;
            String phone = row.value("телефон", "phone", "номер телефона");
            if (phone.isBlank() && (!activeOnly || row.value("user_id").isBlank())) continue;
            result.add(new PersonRow(row.value("фио", "имя", "тренер", "участник", "name"), phone,
                    yes(row.value("прошел верификацию", "верифицирован", "verified")),
                    row.value("личный лист", "лист расписания", "лист тренера", "schedule sheet"), row.value("user_id")));
        }
        return List.copyOf(result);
    }

    public TrainerSheet trainerSheet(
            String trainerName, String sheetName, List<List<String>> values) {
        return trainerSheetParser.parse(trainerName, sheetName, values);
    }

    private boolean yes(String value) { return Set.of("да", "yes", "true", "1").contains(normalize(value)); }
    private boolean no(String value) { return Set.of("нет", "no", "false", "0", "неактивна", "inactive", "отменена").contains(normalize(value)); }
    private static String normalize(String value) { return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replace('ё','е').replaceAll("\\s+", " "); }

    private record Header(Map<String,Integer> indexes) {
        Header(List<String> cells) { this(index(cells)); }
        private static Map<String,Integer> index(List<String> cells) { Map<String,Integer> result=new HashMap<>(); for(int i=0;i<cells.size();i++) result.put(normalize(cells.get(i)),i); return result; }
    }
    private record Row(Header header, List<String> cells) {
        String value(String... aliases) { for(String alias:aliases) { Integer i=header.indexes().get(normalize(alias)); if(i!=null && i<cells.size()) return cells.get(i).trim(); } return ""; }
    }
}
