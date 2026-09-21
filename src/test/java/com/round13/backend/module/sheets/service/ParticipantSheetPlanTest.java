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
        assertThat(first.participants().get(1).get(6).toString()).contains("VLOOKUP(F2");
        var second = ParticipantSheetPlan.build(List.of(student), List.of(trainer), List.of(
                List.of("user_id", "trainer_user_id"), List.of(studentId.toString(), trainerId.toString())), Map.of(), "now");
        assertThat(second.participants()).hasSize(2);
        assertThat(second.added()).isZero();
    }
}
