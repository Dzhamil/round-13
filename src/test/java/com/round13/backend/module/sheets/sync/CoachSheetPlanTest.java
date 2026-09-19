package com.round13.backend.module.sheets.sync;

import com.round13.backend.domain.*;
import com.round13.backend.module.sheets.service.GoogleSheetDataParser;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.assertj.core.api.Assertions.*;

class CoachSheetPlanTest {
    private final CoachSheetPlan planner = new CoachSheetPlan(new RussianPhoneNormalizer());
    private final List<String> header = List.of("Фамилия", "Имя", "Отчество", "Телефон",
            "Ссылка на персональную вкладку", "Прошел верификацию");

    @Test
    void adoptsLegacyRowByNormalizedPhonePreservesScheduleAndIsIdempotentAcrossIdentityChanges() {
        UserEntity user = user("ADMIN", "+79390000001");
        var rows = new ArrayList<List<String>>(List.of(header,
                List.of("Old", "Name", "", "8 (939) 000-00-01", "Immutable schedule", "Да"),
                List.of("Unmatched", "Sheet", "", "+79001112233", "Other schedule", "Да")));
        var profile = new ProfileEntity();
        profile.setSurname("Новая"); profile.setFirstName("Анна"); profile.setPatronymic("Ивановна");
        var profiles = Map.of(user.getId(), profile);
        var writes = planner.build(rows, List.of(user), profiles, List.of());
        assertThat(writes).doesNotContainKeys("'Тренеры'!E2", "'Тренеры'!F2", "'Тренеры'!A3");
        apply(rows, writes);
        assertThat(planner.build(rows, List.of(user), profiles, List.of())).isEmpty();
        user.setPhone("+79390000002"); user.setNickname("new nickname"); profile.setSurname("Другая");
        apply(rows, planner.build(rows, List.of(user), profiles, List.of()));
        assertThat(rows).hasSize(3);
        assertThat(rows.get(1)).contains(user.getId().toString(), "+79390000002", "new nickname", "Другая", "Immutable schedule", "Да");
        assertThat(planner.build(rows, List.of(user), profiles, List.of())).isEmpty();
    }

    @Test
    void preservesImplicitLegacyScheduleTabWhenNameChanges() {
        UserEntity coach = user("COACH", "+79390000001");
        var rows = new ArrayList<List<String>>(List.of(List.of("Имя", "Телефон"),
                List.of("Old schedule tab", coach.getPhone())));
        apply(rows, planner.build(rows, List.of(coach), Map.of(), List.of()));
        assertThat(new GoogleSheetDataParser().people(rows).getFirst().scheduleSheet()).isEqualTo("Old schedule tab");
        assertThat(planner.build(rows, List.of(coach), Map.of(), List.of())).isEmpty();
    }

    @Test
    void previousPhoneSurvivesChangeBeforeFirstSuccessfulSync() {
        UserEntity user = user("COACH", "+79390000002");
        var rows = new ArrayList<List<String>>(List.of(header,
                List.of("Old", "Name", "", "+79390000001", "Schedule", "Да")));
        var writes = planner.build(rows, List.of(user), Map.of(),
                List.of(new CoachSheetChange(user.getId(), "+79390000001")));
        apply(rows, writes);
        assertThat(rows).hasSize(2);
        assertThat(rows.get(1)).contains(user.getId().toString(), "+79390000002");
    }

    @Test
    void appendsCoachesWithoutPhoneAndMarksRevokedOrDeletedRowsInactive() {
        UserEntity coach = user("COACH", null);
        UserEntity admin = user("ADMIN", "+79390000002");
        UserEntity athlete = user("ATHLETE", "+79390000003");
        coach.setStatus(UserStatus.PROFILE_INCOMPLETE);
        admin.setStatus(UserStatus.BLOCKED);
        var users = List.of(coach, admin, athlete);
        var rows = new ArrayList<List<String>>(List.of(header));
        apply(rows, planner.build(rows, users, Map.of(), List.of()));
        assertThat(rows).hasSize(3);
        coach.getRole().setCode("ATHLETE"); admin.setStatus(UserStatus.DELETED);
        apply(rows, planner.build(rows, users, Map.of(), List.of()));
        assertThat(rows).hasSize(3);
        assertThat(rows.get(1)).contains("Нет");
        assertThat(rows.get(2)).contains("Нет");
        assertThat(new GoogleSheetDataParser().people(rows)).isEmpty();
    }

    @Test
    void ambiguousLegacyIdentityFailsBeforeAnyWriteCanBeSent() {
        UserEntity user = user("COACH", "+79390000001");
        List<String> row = List.of("Old", "Name", "", user.getPhone(), "Schedule", "Да");
        assertThatThrownBy(() -> planner.build(List.of(header, row, row), List.of(user), Map.of(), List.of()))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("Duplicate coach identity");
        UserEntity other = user("COACH", "+79390000002");
        assertThatThrownBy(() -> planner.build(List.of(header, row), List.of(user, other), Map.of(),
                List.of(new CoachSheetChange(other.getId(), user.getPhone()))))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("Ambiguous legacy coach phone");
    }

    static UserEntity user(String role, String phone) {
        var user = new UserEntity(); user.setId(UUID.randomUUID()); user.setPhone(phone);
        user.setStatus(UserStatus.ACTIVE); user.setNickname("Coach");
        var entity = new RoleEntity(); entity.setCode(role); user.setRole(entity);
        return user;
    }

    static void apply(List<List<String>> rows, Map<String, String> writes) {
        writes.forEach((range, value) -> {
            String cell = range.substring(range.indexOf('!') + 1);
            int column = cell.charAt(0) - 'A'; int row = Integer.parseInt(cell.substring(1)) - 1;
            while (rows.size() <= row) rows.add(new ArrayList<>());
            var cells = new ArrayList<>(rows.get(row));
            while (cells.size() <= column) cells.add("");
            cells.set(column, value); rows.set(row, cells);
        });
    }
}
