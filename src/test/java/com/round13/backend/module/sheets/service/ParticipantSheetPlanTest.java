package com.round13.backend.module.sheets.service;

import org.junit.jupiter.api.Test;
import java.util.*;
import static org.assertj.core.api.Assertions.*;

class ParticipantSheetPlanTest {
    @Test
    void usesStableTrainerIdAndKeepsOneRowPerIdentity() {
        UUID studentId = UUID.randomUUID(), trainerId = UUID.randomUUID();
        var student = new PersonSheetPlan.Person(studentId, "Student", "recoilbee", "+79990000000", true, "", "", "");
        var trainer = new PersonSheetPlan.Person(trainerId, "ignored", "Tima coach", "+79991111111", true,
                "Иванов", "Тимур", "");
        var previous = List.of(List.of("user_id", "trainer_user_id"), List.of(studentId.toString(), trainerId.toString()),
                List.of(studentId.toString(), trainerId.toString()), List.of("", ""));
        var first = ParticipantSheetPlan.build(List.of(student, student), List.of(trainer), previous, Map.of(), "now");
        assertThat(first.participants()).hasSize(2);
        assertThat(first.participants().get(1).get(5)).isEqualTo("Иванов Тимур");
        assertThat(first.participants().get(1).get(6).toString())
                .isEqualTo("=IFERROR(VLOOKUP(F2,'Справочник тренеров'!A:B,2,FALSE),\"\")");
        var second = ParticipantSheetPlan.build(List.of(student), List.of(trainer), List.of(
                List.of("user_id", "trainer_user_id"), List.of(studentId.toString(), trainerId.toString())), Map.of(), "now");
        assertThat(second.participants()).hasSize(2);
        assertThat(second.added()).isZero();
    }

    @Test
    void deduplicatesByUserIdWhenPhoneAndNicknameAreBlank() {
        UUID studentId = UUID.randomUUID();
        var student = new PersonSheetPlan.Person(studentId, "Student", "", "", true, "", "", "");

        var result = ParticipantSheetPlan.build(List.of(student, student), List.of(), List.of(), Map.of(), "now");

        assertThat(result.participants()).hasSize(2);
        assertThat(result.participants().get(1).getFirst()).isEqualTo(studentId.toString());
    }

    @Test
    void rebuildingEvaluatedSnapshotIsIdempotentAndKeepsManualTrainerChoiceById() {
        UUID studentId = UUID.randomUUID(), selectedId = UUID.randomUUID(), primaryId = UUID.randomUUID();
        var student = new PersonSheetPlan.Person(studentId, "Student", "nick", "+79990000000", true, "", "", "");
        var selected = new PersonSheetPlan.Person(selectedId, "", "selected", "", true, "New surname", "", "");
        var primary = new PersonSheetPlan.Person(primaryId, "", "primary", "", true, "Primary", "", "");
        var previous = List.of(List.of("user_id", "trainer_user_id"),
                List.of(studentId.toString(), selectedId.toString()));
        var first = ParticipantSheetPlan.build(List.of(student, student), List.of(primary, selected), previous,
                Map.of(studentId, primaryId), "now");
        // Google returns the evaluated trainer UUID when the snapshot is read back.
        var evaluated = first.participants().stream().map(row -> new ArrayList<>(row.stream()
                .map(Object::toString).toList())).toList();
        evaluated.get(1).set(6, selectedId.toString());
        var second = ParticipantSheetPlan.build(List.of(student), List.of(selected, primary),
                new ArrayList<>(evaluated), Map.of(studentId, primaryId), "now");
        assertThat(second).isEqualTo(first);
        assertThat(second.added()).isZero();
        assertThat(second.participants().get(1).get(5)).isEqualTo("New surname");
    }
}
