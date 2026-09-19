package com.round13.backend.module.sheets.sync;

import com.round13.backend.domain.ProfileEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.user.CoachMembership;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Stream;

/** Plans cell-level writes; never clears a sheet, verification flags, or schedule links. */
@Component
@RequiredArgsConstructor
public class CoachSheetPlan {
    private final RussianPhoneNormalizer phones;

    public Map<String, String> build(List<List<String>> rows, List<UserEntity> users,
                                     Map<UUID, ProfileEntity> profiles, List<CoachSheetChange> changes) {
        List<String> existingHeader = rows.isEmpty() ? List.of() : rows.getFirst();
        CoachSheetColumns columns = new CoachSheetColumns(existingHeader);
        Map<String, String> writes = new LinkedHashMap<>();
        for (int i = existingHeader.size(); i < columns.headers().size(); i++) {
            writes.put(CoachSheetColumns.cell(0, i), columns.headers().get(i));
        }
        Map<String, Integer> ids = new HashMap<>();
        for (int i = 1; i < rows.size(); i++) {
            String id = columns.value(rows.get(i), "userId");
            if (!id.isBlank() && ids.put(id, i) != null) throw new IllegalStateException("Duplicate coach sheet user ID");
        }
        Map<String, Set<UUID>> phoneOwners = new HashMap<>();
        for (UserEntity user : users) addPhoneOwner(phoneOwners, user.getPhone(), user.getId());
        for (CoachSheetChange change : changes) addPhoneOwner(phoneOwners, change.getPreviousPhone(), change.getUserId());
        Map<UUID, List<Integer>> legacyRows = new HashMap<>();
        for (int i = 1; i < rows.size(); i++) {
            if (!columns.value(rows.get(i), "userId").isBlank()) continue;
            String phone = phones.normalize(columns.value(rows.get(i), "phone")).orElse("");
            Set<UUID> owners = phoneOwners.getOrDefault(phone, Set.of());
            if (owners.size() > 1) throw new IllegalStateException("Ambiguous legacy coach phone; bind Round13 ID manually");
            if (owners.size() == 1) legacyRows.computeIfAbsent(owners.iterator().next(), key -> new ArrayList<>()).add(i);
        }
        int nextRow = Math.max(1, rows.size());
        for (UserEntity user : users) {
            Integer rowIndex = ids.get(user.getId().toString());
            List<Integer> candidates = legacyRows.getOrDefault(user.getId(), List.of());
            if (candidates.size() > 1 || (rowIndex != null && !candidates.isEmpty())) {
                throw new IllegalStateException("Duplicate coach identity; reconcile sheet rows before syncing");
            }
            if (rowIndex == null && !candidates.isEmpty()) rowIndex = candidates.getFirst();
            boolean coach = CoachMembership.includes(user);
            if (rowIndex == null && !coach) continue;
            if (rowIndex == null) rowIndex = nextRow++;
            List<String> oldRow = rowIndex < rows.size() ? rows.get(rowIndex) : List.of();
            Map<String, String> values = identity(user, profiles.get(user.getId()));
            values.put("active", coach ? "Да" : "Нет");
            // Legacy import used the old display name as a tab name. Freeze that link on adoption.
            if (!oldRow.isEmpty() && columns.value(oldRow, "userId").isBlank()
                    && columns.value(oldRow, "schedule").isBlank()) {
                String oldName = columns.value(oldRow, "name");
                if (oldName.isBlank()) oldName = Stream.of("surname", "firstName", "patronymic")
                        .map(field -> columns.value(oldRow, field)).filter(value -> !value.isBlank())
                        .collect(java.util.stream.Collectors.joining(" "));
                if (!oldName.isBlank()) values.put("schedule", oldName);
            }
            for (var entry : values.entrySet()) {
                if (!entry.getValue().equals(columns.value(oldRow, entry.getKey()))) {
                    writes.put(CoachSheetColumns.cell(rowIndex, columns.index(entry.getKey())), entry.getValue());
                }
            }
        }
        return writes;
    }

    private void addPhoneOwner(Map<String, Set<UUID>> owners, String phone, UUID userId) {
        phones.normalize(phone).ifPresent(value -> owners.computeIfAbsent(value, key -> new HashSet<>()).add(userId));
    }

    private Map<String, String> identity(UserEntity user, ProfileEntity profile) {
        Map<String, String> values = new LinkedHashMap<>();
        values.put("userId", user.getId().toString());
        values.put("phone", text(user.getPhone()));
        values.put("nickname", text(user.getNickname()));
        values.put("role", user.getRole().getCode());
        values.put("surname", profile == null ? "" : text(profile.getSurname()));
        values.put("firstName", profile == null ? "" : text(profile.getFirstName()));
        values.put("patronymic", profile == null ? "" : text(profile.getPatronymic()));
        String fullName = Stream.of(values.get("surname"), values.get("firstName"), values.get("patronymic"))
                .filter(value -> !value.isBlank()).reduce((a, b) -> a + " " + b).orElse("");
        if (fullName.isBlank() && profile != null) fullName = text(profile.getFullName());
        if (fullName.isBlank()) fullName = text(user.getNickname());
        if (fullName.isBlank()) fullName = text(user.getPhone());
        values.put("name", fullName);
        return values;
    }

    private String text(String value) { return value == null ? "" : value.trim(); }
}
