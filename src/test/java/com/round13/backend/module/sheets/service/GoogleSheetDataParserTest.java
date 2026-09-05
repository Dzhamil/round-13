package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.TrainingType;
import org.junit.jupiter.api.Test;

import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GoogleSheetDataParserTest {
    private final GoogleSheetDataParser parser = new GoogleSheetDataParser();

    @Test
    void mapsVerificationForRussianTrainerAndParticipantRows() {
        var rows = parser.people(List.of(
                List.of("ФИО", "Телефон", "Прошел верификацию", "Лист расписания"),
                List.of("Dzhamill", "+7 (939) 393-09-20", "Да", "Dzhamill"),
                List.of("Test", "+7 999 000-11-22", "Нет", "")));

        assertThat(rows).extracting(GoogleSheetDataParser.PersonRow::verified).containsExactly(true, false);
        assertThat(rows.getFirst().scheduleSheet()).isEqualTo("Dzhamill");
    }

    @Test
    void parsesPersonalSplitMiniGroupAndGroupRows() {
        var rows = parser.trainings(List.of(
                List.of("Дата", "Время", "Тип тренировки", "Название", "Длительность", "Место", "Активна"),
                List.of("2026-09-07", "10:00", "Персональная", "Personal", "60", "Зал", "Да"),
                List.of("09.09.2026", "11:00", "Сплит", "Split", "75", "Зал", "Да"),
                List.of("10.09.2026", "12:00", "Мини-группа", "Mini", "90", "Ринг", "Да"),
                List.of("12.09.2026", "13:00", "Групповая", "Group", "60", "Ринг", "Нет")),
                ZoneId.of("Europe/Moscow"));

        assertThat(rows).extracting(GoogleSheetDataParser.TrainingRow::type)
                .containsExactly(TrainingType.PERSONAL, TrainingType.PERSONAL, TrainingType.GROUP, TrainingType.GROUP);
        assertThat(rows).extracting(GoogleSheetDataParser.TrainingRow::active)
                .containsExactly(true, true, true, false);
        assertThat(rows.getFirst().startTime().getOffset().getTotalSeconds()).isEqualTo(3 * 3600);
    }

    @Test
    void parsesRecurringDefinitionWithoutInventingCalendarDate() {
        var rows = parser.trainings(List.of(
                List.of("Тип тренировки", "Название", "Дни недели", "Время", "Активна"),
                List.of("Мини-группа", "Morning boxing", "Пн, Ср", "09:00", "Да")),
                ZoneId.of("Europe/Moscow"));

        assertThat(rows).singleElement().satisfies(row -> {
            assertThat(row.startTime()).isNull();
            assertThat(row.schedule()).isEqualTo("Пн, Ср");
            assertThat(row.active()).isTrue();
        });
    }
}
