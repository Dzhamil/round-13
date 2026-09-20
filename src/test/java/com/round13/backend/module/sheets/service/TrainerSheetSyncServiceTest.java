package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TrainerSheetSyncServiceTest {
    private final GoogleSheetSpaceRepository spaces = mock(GoogleSheetSpaceRepository.class);
    private final GoogleSheetsGateway gateway = mock(GoogleSheetsGateway.class);
    private final UserRepository users = mock(UserRepository.class);
    private final ProfileRepository profiles = mock(ProfileRepository.class);
    private final TrainerSheetSyncService service = new TrainerSheetSyncService(spaces, gateway, users, profiles);
    private final GoogleSheetSpaceEntity space = new GoogleSheetSpaceEntity();
    private final List<List<String>> sheet = new ArrayList<>();

    private void setup() {
        space.setSpreadsheetId("test-sheet");
        when(spaces.findActiveForUpdate()).thenReturn(Optional.of(space));
        when(gateway.readRows(space, "'Тренеры'!A:ZZ")).thenAnswer(call -> sheet);
        doAnswer(call -> {
            List<GoogleSheetsGateway.ValueUpdate> updates = call.getArgument(1);
            for (var update : updates) {
                String cell = update.range().split("!")[1];
                int column = 0;
                for (char c : cell.replaceAll("[0-9]", "").toCharArray()) column = column * 26 + c - 'A' + 1;
                int row = Integer.parseInt(cell.replaceAll("[A-Z]", "")) - 1;
                while (sheet.size() <= row) sheet.add(new ArrayList<>());
                var values = update.values().getFirst();
                while (sheet.get(row).size() < column - 1 + values.size()) sheet.get(row).add("");
                for (int i = 0; i < values.size(); i++) sheet.get(row).set(column - 1 + i, values.get(i).toString());
            }
            return null;
        }).when(gateway).updateValues(eq(space), any());
    }

    @Test
    void reconcilesByIdPreservesHistoryAndSupportsRepeatRevokeRegrantAndProfileChanges() {
        setup();
        UserEntity trainer = user("COACH", true);
        UserEntity adminTrainer = user("ADMIN", true);
        UserEntity admin = user("ADMIN", false);
        UserEntity deleted = user("COACH", true); deleted.setStatus(UserStatus.DELETED);
        var profile = new ProfileEntity(); profile.setUser(trainer); profile.setSurname("Иванов");
        profile.setFirstName("Иван"); profile.setPatronymic("Иванович");
        when(profiles.findByUserIdIn(any())).thenReturn(List.of(profile));
        when(users.findTrainerMirrorCandidates()).thenReturn(List.of(trainer, adminTrainer, deleted));
        when(users.findAllById(any())).thenReturn(List.of(trainer, adminTrainer, admin, deleted));
        sheet.add(new ArrayList<>(List.of("Имя", "user_id", "Телефон", "Лист тренера", "Активен", "Заметки")));
        sheet.add(new ArrayList<>(List.of("old", trainer.getId().toString(), "old phone", "Старый личный лист", "Да", "=1+1")));
        sheet.add(new ArrayList<>(List.of("admin", admin.getId().toString(), "", "", "Да")));
        sheet.add(new ArrayList<>(List.of(trainer.getNickname(), "", trainer.getPhone(), "Фейковый лист", "Да")));
        sheet.add(new ArrayList<>(List.of("deleted", deleted.getId().toString(), "", "История", "Да")));
        sheet.add(new ArrayList<>(List.of("duplicate", trainer.getId().toString(), "", "Дубль листа", "Да")));

        var first = service.syncActive();
        assertThat(first.activeTrainers()).isEqualTo(2);
        assertThat(first.addedRows()).isOne();
        assertThat(first.inactiveRows()).isEqualTo(4);
        assertThat(first.unmatchedRows()).isOne();
        assertThat(first.duplicateRows()).isOne();
        assertThat(sheet.get(1)).contains("Иванов Иван Иванович", "Старый личный лист", "=1+1");
        assertThat(sheet.get(3).get(1)).isEmpty(); // Never match by name/phone.
        assertThat(service.syncActive().addedRows()).isZero();
        assertThat(sheet).hasSize(7);

        trainer.setTrainer(false); trainer.setNickname("new nick"); trainer.setPhone("+79990000099");
        profile.setSurname("Петров");
        assertThat(service.syncActive().activeTrainers()).isOne();
        assertThat(sheet.get(1)).contains("Петров Иван Иванович", "new nick", "+79990000099", "Нет", "Старый личный лист");
        trainer.setTrainer(true);
        assertThat(service.syncActive().activeTrainers()).isEqualTo(2);
        assertThat(sheet).hasSize(7);
        verify(gateway, never()).replaceRows(any(), any(), any());
        verify(gateway, never()).appendRows(any(), any(), any());
        verify(users, never()).save(any());
    }

    @Test
    void emptyDbDeactivatesAllExistingRowsAndEmptySheetGetsHeaders() {
        setup();
        assertThat(service.syncActive().activeTrainers()).isZero();
        assertThat(sheet.getFirst()).contains("user_id", "ФИО", "Ник", "Телефон", "Активен", "Личный лист");
        sheet.add(new ArrayList<>(List.of("invalid", "Fake", "", "", "Да")));
        assertThat(service.syncActive().inactiveRows()).isOne();
        assertThat(sheet.get(1).get(4)).isEqualTo("Нет");
    }

    @Test
    void missingSpaceOrReadFailureDoesNotWrite() {
        assertThatThrownBy(service::syncActive).hasMessageContaining("не настроено");
        setup();
        when(gateway.readRows(any(), any())).thenThrow(new IllegalStateException("read failed"));
        assertThatThrownBy(service::syncActive).hasMessageContaining("read failed");
        verify(gateway, never()).updateValues(any(), any());
    }

    @Test
    void writeFailureIsNotReportedAsSuccess() {
        setup();
        doThrow(new IllegalStateException("write failed")).when(gateway).updateValues(any(), any());
        assertThatThrownBy(service::syncActive).hasMessageContaining("write failed");
        assertThat(sheet).isEmpty();
    }

    @Test
    void ambiguousHeadersFailBeforeWritingAndInactiveRowsAreNotWorkingTrainers() {
        assertThatThrownBy(() -> new PersonSheetPlan("Тренеры", List.of(List.of("ФИО", "full_name"))))
                .hasMessageContaining("Неоднозначные");
        assertThat(new GoogleSheetDataParser().activeTrainers(List.of(List.of("Имя", "Телефон", "Активен"),
                List.of("Fake", "+79990000001", "Нет"), List.of("Real", "+79990000002", "Да"))))
                .extracting(GoogleSheetDataParser.PersonRow::name).containsExactly("Real");
    }

    @Test
    void structuredColumnsNeverReceiveLegacyNameOrNicknameAndClearStaleValues() {
        setup();
        var trainer = user("COACH", true);
        var profile = new ProfileEntity(); profile.setUser(trainer); profile.setFullName("Legacy Full Name");
        when(users.findTrainerMirrorCandidates()).thenReturn(List.of(trainer));
        when(profiles.findByUserIdIn(any())).thenReturn(List.of(profile));
        sheet.add(new ArrayList<>(List.of("user_id", "Фамилия", "Имя", "Отчество", "ФИО", "Ник")));
        sheet.add(new ArrayList<>(List.of(trainer.getId().toString(), "old", "old", "old", "old", "old")));
        service.syncActive();
        assertThat(sheet.get(1).subList(1, 6)).containsExactly("", "", "", "Legacy Full Name", trainer.getNickname());
        profile.setFirstName("Explicit first");
        service.syncActive();
        assertThat(sheet.get(1).subList(1, 6)).containsExactly("", "Explicit first", "", "Explicit first", trainer.getNickname());
        assertThat(sheet).hasSize(2);
    }

    private UserEntity user(String roleCode, boolean trainer) {
        var role = new RoleEntity(); role.setCode(roleCode);
        var user = new UserEntity(); user.setId(UUID.randomUUID()); user.setRole(role);
        user.setTrainer(trainer); user.setStatus(UserStatus.ACTIVE);
        user.setNickname("nick-" + roleCode); user.setPhone("+79990000001");
        return user;
    }
}
