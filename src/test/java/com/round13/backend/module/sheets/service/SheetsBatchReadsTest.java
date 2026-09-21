package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.junit.jupiter.api.Test;
import org.springframework.dao.IncorrectResultSizeDataAccessException;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class SheetsBatchReadsTest {
    final GoogleSheetSpaceRepository spaces = mock(GoogleSheetSpaceRepository.class);
    final GoogleSheetsGateway gateway = mock(GoogleSheetsGateway.class);
    final GoogleSheetSpaceEntity space = new GoogleSheetSpaceEntity();
    final UserRepository users = mock(UserRepository.class);
    final GoogleSheetDataParser parser = mock(GoogleSheetDataParser.class);
    final GoogleSheetSyncService importer = new GoogleSheetSyncService(spaces, gateway, parser, users, new RussianPhoneNormalizer());

    @Test void phoneChunksPreserveFirstRowAndMissingRowCounts() {
        configured();
        var people = new ArrayList<GoogleSheetDataParser.PersonRow>();
        for (int i = 0; i < 501; i++) people.add(person(String.format("+7999%07d", i), true));
        people.add(person("+79990000000", false));
        people.add(person("invalid", false)); people.add(person("+79990000999", false)); people.add(person("+79990000999", false));
        when(parser.people(anyList())).thenReturn(people);
        when(users.findByPhoneIn(any())).thenAnswer(call -> ((List<String>) call.getArgument(0)).stream()
                .filter(phone -> !phone.equals("+79990000999")).map(this::user).toList());
        var result = importer.syncActive();
        assertThat(result.usersUpdated()).isEqualTo(501); assertThat(result.usersNotFound()).isEqualTo(3);
        verify(users, times(2)).findByPhoneIn(argThat(phones -> phones.size() <= 500));
        verify(users).saveAll(argThat(rows -> {
            var list = new ArrayList<UserEntity>(); rows.forEach(list::add);
            return list.size() == 501 && list.stream().allMatch(UserEntity::isPhoneVerifiedByStaff);
        }));
        verify(users, never()).findByPhone(any());
    }

    @Test void duplicateDatabasePhonesStillFailAndUnchangedUsersAreNotSaved() {
        configured(); when(parser.people(anyList())).thenReturn(List.of(person("+79990000000", false)));
        var user = user("+79990000000"); when(users.findByPhoneIn(any())).thenReturn(List.of(user));
        assertThat(importer.syncActive().usersUpdated()).isZero(); verify(users, never()).saveAll(any());
        when(users.findByPhoneIn(any())).thenReturn(List.of(user, user("+79990000000")));
        assertThatThrownBy(importer::syncActive).isInstanceOf(IncorrectResultSizeDataAccessException.class);
    }

    void configured() { space.setCredentialsEnvVar("TEST"); when(spaces.findByActiveTrue()).thenReturn(Optional.of(space)); }
    UserEntity user(String phone) { var user = new UserEntity(); user.setId(UUID.randomUUID()); user.setPhone(phone); return user; }
    GoogleSheetDataParser.PersonRow person(String phone, boolean verified) {
        return new GoogleSheetDataParser.PersonRow("", phone, verified, "");
    }
}
