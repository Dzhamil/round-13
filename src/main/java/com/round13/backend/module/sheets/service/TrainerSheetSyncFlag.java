package com.round13.backend.module.sheets.service;

import java.util.List;

/** Missing/blank flags are disabled; ambiguous controls fail closed before parsing a schedule. */
final class TrainerSheetSyncFlag {
    private TrainerSheetSyncFlag() {}

    static boolean enabled(String sheetName, List<List<String>> rows) {
        var grid = new TrainerSheetGrid(sheetName, rows);
        Boolean enabled = null;
        for (int row = 0; row < rows.size(); row++) {
            // The control belongs above the catalogue, never in student or training content.
            if (grid.column(row, "id тренировки") >= 0) break;
            for (int col = 0; col < rows.get(row).size(); col++) {
                if (!TrainerSheetGrid.normalized(grid.cell(row, col)).equals("синхронизация")) continue;
                if (enabled != null) throw grid.error(row, col, "Повторный флаг синхронизации");
                enabled = switch (TrainerSheetGrid.normalized(grid.cell(row, col + 1))) {
                    case "true", "да", "yes", "1" -> true;
                    case "", "false", "нет", "no", "0" -> false;
                    default -> throw grid.error(row, col + 1, "Некорректный флаг синхронизации");
                };
            }
        }
        return Boolean.TRUE.equals(enabled);
    }
}
