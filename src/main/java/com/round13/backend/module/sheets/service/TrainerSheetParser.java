package com.round13.backend.module.sheets.service;

import com.round13.backend.module.sheets.model.TrainerSheet;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/** Parses the training catalogue and resolves details by the visible sheet-local ID anchor. */
final class TrainerSheetParser {
    private static final List<String> HEADERS = List.of(
            "id тренировки", "тип тренировки", "название тренировки", "длительность", "детальная таблица");
    private static final Pattern DETAIL = Pattern.compile("тренировка id ([1-9][0-9]*)");
    private static final Pattern LINK_LABEL = Pattern.compile("(?:открыть тренировку |тренировка id )([1-9][0-9]*)");
    private static final Pattern CELL_REFERENCE = Pattern.compile("\\$?([A-Za-z]{1,3})\\$?([1-9][0-9]*)");
    private final TrainerDetailTableParser details = new TrainerDetailTableParser();

    TrainerSheet parse(String trainerName, String sheetName, List<List<String>> values) {
        var grid = new TrainerSheetGrid(sheetName, values);
        if (values.stream().flatMap(List::stream).allMatch(value -> value == null || value.isBlank())) {
            return new TrainerSheet(trainerName, sheetName, List.of());
        }
        int header = findHeader(grid);
        List<Integer> columns = HEADERS.stream().map(name -> grid.column(header, name)).toList();
        Map<Integer, Integer> anchors = findDetails(grid, header, columns.get(0));
        int end = anchors.values().stream().filter(row -> row > header).min(Integer::compareTo).orElse(values.size());
        List<TrainerSheet.Training> trainings = new ArrayList<>();
        Set<Integer> seen = new HashSet<>();
        for (int row = header + 1; row < end; row++) {
            final int currentRow = row;
            if (columns.stream().allMatch(col -> grid.cell(currentRow, col).isBlank())) continue;
            int id = positiveInteger(grid, row, columns.get(0), "ID тренировки");
            if (!seen.add(id)) throw grid.error(row, columns.get(0), "Повторный ID тренировки " + id);
            String type = required(grid, row, columns.get(1));
            String title = required(grid, row, columns.get(2));
            int duration = positiveInteger(grid, row, columns.get(3), "Длительность в минутах");
            String reference = required(grid, row, columns.get(4));
            Integer anchor = anchors.get(id);
            if (anchor == null || anchor <= header) {
                throw grid.error(row, columns.get(4), "Не найдена детальная таблица: Тренировка ID " + id);
            }
            validateReference(grid, row, columns.get(4), reference, id, anchor);
            int detailEnd = anchors.values().stream().filter(position -> position > anchor)
                    .min(Integer::compareTo).orElse(values.size());
            trainings.add(new TrainerSheet.Training(id, type, title, duration, details.parse(grid, anchor, detailEnd)));
        }
        if (!seen.equals(anchors.keySet())) throw grid.error(header, columns.get(0), "Детальная таблица без строки головной таблицы");
        return new TrainerSheet(trainerName, sheetName, trainings);
    }

    private int findHeader(TrainerSheetGrid grid) {
        int found = -1;
        for (int row = 0; row < grid.rows().size(); row++) {
            if (grid.column(row, "id тренировки") < 0) continue;
            if (found >= 0) throw grid.error(row, 0, "Повторная головная таблица");
            for (String name : HEADERS) {
                int column = grid.column(row, name);
                if (column < 0) throw grid.error(row, 0, "Отсутствует колонка: " + name);
                long count = grid.rows().get(row).stream().filter(cell -> cell != null
                        && TrainerSheetGrid.normalized(cell).equals(name)).count();
                if (count != 1) throw grid.error(row, column, "Повторная колонка: " + name);
            }
            found = row;
        }
        if (found < 0) throw grid.error(0, 0, "Не найдена головная таблица с ID тренировки");
        return found;
    }

    private Map<Integer, Integer> findDetails(TrainerSheetGrid grid, int header, int idColumn) {
        Map<Integer, Integer> anchors = new HashMap<>();
        for (int row = header + 1; row < grid.rows().size(); row++) {
            if (grid.cell(row, idColumn).matches("[1-9][0-9]*")) continue;
            for (int col = 0; col < grid.rows().get(row).size(); col++) {
                var matcher = DETAIL.matcher(TrainerSheetGrid.normalized(grid.cell(row, col)));
                if (!matcher.matches()) continue;
                int id;
                try { id = Integer.parseInt(matcher.group(1)); }
                catch (NumberFormatException ex) { throw grid.error(row, col, "Слишком большой ID тренировки"); }
                if (anchors.putIfAbsent(id, row) != null) throw grid.error(row, col, "Повторная детальная таблица ID " + id);
            }
        }
        return anchors;
    }

    private void validateReference(TrainerSheetGrid grid, int row, int col, String reference, int id, int anchor) {
        var label = LINK_LABEL.matcher(TrainerSheetGrid.normalized(reference));
        if (label.matches() && label.group(1).equals(Integer.toString(id))) return;
        // A plain cell address can be supplied instead of the rich-text display label.
        var cell = CELL_REFERENCE.matcher(reference);
        if (cell.matches() && cell.group(2).equals(Integer.toString(anchor + 1))) {
            int column = 0;
            for (char letter : cell.group(1).toUpperCase(java.util.Locale.ROOT).toCharArray()) {
                column = column * 26 + letter - 'A' + 1;
            }
            if (TrainerSheetGrid.normalized(grid.cell(anchor, column - 1)).equals("тренировка id " + id)) return;
        }
        throw grid.error(row, col, "Неоднозначная связь с детальной таблицей ID " + id
                + ": ожидается «Открыть тренировку " + id + "» или адрес ячейки заголовка");
    }

    private String required(TrainerSheetGrid grid, int row, int col) {
        String value = grid.cell(row, col);
        if (value.isBlank()) throw grid.error(row, col, "Обязательное поле пусто");
        return value;
    }

    private int positiveInteger(TrainerSheetGrid grid, int row, int col, String field) {
        String value = required(grid, row, col);
        if (value.matches("[1-9][0-9]*")) {
            try { return Integer.parseInt(value); } catch (NumberFormatException ignored) { }
        }
        throw grid.error(row, col, field + " должен быть положительным целым числом");
    }
}
