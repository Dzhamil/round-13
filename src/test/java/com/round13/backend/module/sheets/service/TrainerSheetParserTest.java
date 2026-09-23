package com.round13.backend.module.sheets.service;

import com.round13.backend.module.sheets.model.TrainerSheet;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

class TrainerSheetParserTest {
    private final GoogleSheetDataParser parser = new GoogleSheetDataParser();

    // Mirrors the visible Apps Script layout, including action column and merged header blanks.
    static List<List<String>> example() {
        return List.of(
                List.of("", "Таблица тренера: Тренер"),
                List.of("", "Синхронизация", "FALSE"),
                List.of(),
                List.of("", "ID тренировки", "Тип тренировки", "Название тренировки", "Длительность", "Детальная таблица"),
                List.of("Удалить", "1", "Сплит", "Бокс", "75", "Открыть тренировку 1"),
                List.of("", "2", "Мини-группа", "Техника", "90", "Открыть тренировку 2"),
                List.of("Добавить тренировку"),
                List.of(),
                List.of("", "Тренировка ID 2"),
                List.of("", "№", "Ученик", "25.09.2026", "", "", "", "Добавить дату"),
                List.of("", "", "", "Оплатил", "Посетил", "Оплатил", "Посетил"),
                List.of("Удалить", "1", "Гость", "Нет", "Да"),
                List.of("Добавить ученика"),
                List.of(),
                List.of("", "Тренировка ID 1"),
                List.of("", "№", "ФИО", "Никнейм", "24.09.2026 18:30", "", "2026-09-22", ""),
                List.of("", "", "", "", "Оплатил", "Посетил", "Оплатил", "Посетил"),
                List.of("Удалить", "1", "Иван Иванов", "ivan", "TRUE", "FALSE", "нет", "да"),
                List.of(),
                List.of("Удалить", "2", "", "boxer", "0", "1"),
                List.of("Добавить ученика"));
    }

    @Test
    void readsCatalogueAndDetailsByIdPreservingTrainingStudentAndDateOrder() {
        var sheet = parse(example());
        assertThat(sheet.trainerName()).isEqualTo("Тренер");
        assertThat(sheet.sheetName()).isEqualTo("Лист тренера");
        assertThat(sheet.trainings()).extracting(TrainerSheet.Training::trainingId).containsExactly(1, 2);
        var training = sheet.trainings().getFirst();
        assertThat(training.type()).isEqualTo("Сплит");
        assertThat(training.title()).isEqualTo("Бокс");
        assertThat(training.durationMinutes()).isEqualTo(75);
        assertThat(training.students()).extracting(TrainerSheet.Student::displayName).containsExactly("Иван Иванов", "boxer");
        assertThat(training.students().getFirst().dates()).containsExactly(
                new TrainerSheet.AttendanceDate(LocalDate.of(2026, 9, 24), LocalTime.of(18, 30), true, false, 6),
                new TrainerSheet.AttendanceDate(LocalDate.of(2026, 9, 22), null, false, true, 8));
        assertThat(training.students().getLast().dates()).containsExactly(
                new TrainerSheet.AttendanceDate(LocalDate.of(2026, 9, 24), LocalTime.of(18, 30), false, true, 6),
                new TrainerSheet.AttendanceDate(LocalDate.of(2026, 9, 22), null, false, false, 8));
        assertThat(sheet.trainings().getLast().students().getFirst().dates()).singleElement()
                .isEqualTo(new TrainerSheet.AttendanceDate(LocalDate.of(2026, 9, 25), null, false, true, 5));
    }

    @ParameterizedTest
    @CsvSource({"Да,true", "TRUE,true", "yes,true", "1,true", "Нет,false", "FALSE,false", "no,false", "0,false", "' ',false"})
    void readsBooleanValuesAndBlankAsFalse(String value, boolean expected) {
        var rows = mutable();
        rows.get(17).set(4, value);
        rows.get(17).set(5, value);
        var date = parse(rows).trainings().getFirst().students().getFirst().dates().getFirst();
        assertThat(date.paid()).isEqualTo(expected);
        assertThat(date.attended()).isEqualTo(expected);
    }

    @ParameterizedTest
    @ValueSource(strings = {"31.02.2026", "2026-02-29", "22.09.2026 25:00", "tomorrow"})
    void rejectsInvalidCalendarDatesAndTimes(String value) {
        var rows = mutable(); rows.get(15).set(4, value);
        assertThatThrownBy(() -> parse(rows)).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Лист тренера").hasMessageContaining("строка 16");
    }

    @Test
    void rejectsUnknownBooleansWithCellCoordinates() {
        var rows = mutable(); rows.get(17).set(5, "возможно");
        assertThatThrownBy(() -> parse(rows)).hasMessageContaining("строка 18, столбец 6").hasMessageContaining("boolean");
    }

    @Test
    void supportsEmptySheetsAndHeaderOnlyCatalogue() {
        assertThat(parse(List.of()).trainings()).isEmpty();
        assertThat(parse(List.of(List.of(" "))).trainings()).isEmpty();
        assertThat(parse(example().subList(0, 4)).trainings()).isEmpty();
    }

    @Test
    void allowsNoStudentsAndNoConfiguredDates() {
        var rows = mutable();
        rows.remove(19); rows.remove(17); rows.remove(11);
        rows.get(9).set(3, "");
        assertThat(parse(rows).trainings()).allSatisfy(training -> assertThat(training.students()).isEmpty());
    }

    @Test
    void readsAllDatePairsBeyondColumnZ() {
        var rows = mutable();
        for (int row : List.of(15, 16, 17, 19)) {
            while (rows.get(row).size() < 30) rows.get(row).add("");
        }
        rows.get(15).set(28, "01.10.2026");
        rows.get(16).set(28, "Оплатил"); rows.get(16).set(29, "Посетил");
        rows.get(17).set(28, "Да"); rows.get(17).set(29, "Нет");
        assertThat(parse(rows).trainings().getFirst().students().getFirst().dates()).hasSize(3)
                .last().isEqualTo(new TrainerSheet.AttendanceDate(LocalDate.of(2026, 10, 1), null, true, false, 30));
    }

    @Test
    void supportsReorderedCatalogueColumnsAndNormalizesHeaders() {
        var rows = mutable();
        for (int row : List.of(3, 4, 5)) Collections.swap(rows.get(row), 1, 3);
        rows.get(3).set(3, "  ID   ТРЕНИРОВКИ  ");
        assertThat(parse(rows).trainings()).extracting(TrainerSheet.Training::trainingId).containsExactly(1, 2);
    }

    @Test
    void acceptsExplicitAnchorCellReference() {
        var rows = mutable(); rows.get(4).set(5, "$B$15");
        assertThat(parse(rows).trainings()).hasSize(2);
    }

    @Test
    void rejectsFlatLegacyFormat() {
        assertThatThrownBy(() -> parse(List.of(List.of("Дата", "Время", "Тип", "Название"),
                List.of("22.09.2026", "10:00", "Сплит", "Бокс")))).hasMessageContaining("головная таблица");
    }

    @ParameterizedTest
    @CsvSource({"5,1,1,Повторный ID", "4,1,0,положительным", "4,4,abc,положительным",
            "4,5,Открыть тренировку 2,Неоднозначная", "14,1,Тренировка ID 2,Повторная детальная",
            "14,1,Missing,Не найдена детальная", "16,5,Оплатил,пара", "16,4,Посетил,без парной",
            "15,6,24.09.2026 18:30,Повторная дата", "15,5,01.01.2026,Разные даты",
            "11,5,Да,без даты", "3,5,Missing,Отсутствует колонка", "4,3,' ',Обязательное поле"})
    void rejectsMalformedStructure(int row, int col, String value, String error) {
        var rows = mutable();
        while (rows.get(row).size() <= col) rows.get(row).add("");
        rows.get(row).set(col, value);
        assertThatThrownBy(() -> parse(rows)).isInstanceOf(IllegalArgumentException.class).hasMessageContaining(error);
    }

    @Test
    void rejectsStatusesWithoutStudentName() {
        var rows = mutable(); rows.get(17).set(2, ""); rows.get(17).set(3, "");
        assertThatThrownBy(() -> parse(rows)).hasMessageContaining("без имени ученика");
    }

    @ParameterizedTest
    @ValueSource(strings = {"Персональная", "Сплит", "Мини-группа", "Групповая"})
    void preservesTrainingTypeWithoutCollapsingItToLegacyEnum(String type) {
        var rows = mutable(); rows.get(4).set(2, type);
        assertThat(parse(rows).trainings().getFirst().type()).isEqualTo(type);
    }

    @Test
    void supportsNicknameOnlyDetailHeader() {
        var rows = mutable(); rows.get(9).set(2, "Ник");
        assertThat(parse(rows).trainings().getLast().students().getFirst().displayName()).isEqualTo("Гость");
    }

    @Test
    void rejectsCellReferenceThatPointsToAnotherColumnOnAnchorRow() {
        var rows = mutable(); rows.get(4).set(5, "C15");
        assertThatThrownBy(() -> parse(rows)).hasMessageContaining("Неоднозначная связь");
    }

    @Test
    void rejectsOrphanDetailsInsteadOfSilentlyDroppingStudents() {
        var rows = mutable(); rows.remove(5);
        assertThatThrownBy(() -> parse(rows)).hasMessageContaining("без строки головной таблицы");
    }

    @Test
    void rejectsDateWithRemovedStatusHeaders() {
        var rows = mutable(); rows.get(16).set(6, ""); rows.get(16).set(7, "");
        assertThatThrownBy(() -> parse(rows)).hasMessageContaining("нет пары Оплатил / Посетил");
    }

    @Test
    void resultCollectionsAreImmutable() {
        var sheet = parse(example());
        assertThatThrownBy(() -> sheet.trainings().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> sheet.trainings().getFirst().students().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> sheet.trainings().getFirst().students().getFirst().dates().clear())
                .isInstanceOf(UnsupportedOperationException.class);
    }

    private TrainerSheet parse(List<List<String>> values) { return parser.trainerSheet("Тренер", "Лист тренера", values); }
    private List<List<String>> mutable() {
        return new ArrayList<>(example().stream().map(row -> (List<String>) new ArrayList<>(row)).toList());
    }
}
