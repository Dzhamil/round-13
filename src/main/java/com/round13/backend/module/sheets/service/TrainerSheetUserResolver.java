package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

/** One user batch and bounded profile batches, with exact normalized and unambiguous identity matching. */
@Component
@RequiredArgsConstructor
public class TrainerSheetUserResolver {
    private final UserRepository users;
    private final ProfileRepository profiles;
    private final RussianPhoneNormalizer phones;

    public Directory load() {
        Map<UUID, UserEntity> byId = new HashMap<>();
        Map<String, Set<UUID>> names = new HashMap<>();
        Map<String, Set<UUID>> phoneIds = new HashMap<>();
        users.findAllWithRole().stream().filter(u -> !u.isDeleted()).forEach(u -> {
            byId.put(u.getId(), u);
            add(names, u.getNickname(), u.getId());
            phones.normalize(u.getPhone()).ifPresent(phone -> add(phoneIds, phone, u.getId()));
        });
        var ids = List.copyOf(byId.keySet());
        for (int start = 0; start < ids.size(); start += 500) {
            for (var profile : profiles.findByUserIdIn(ids.subList(start, Math.min(start + 500, ids.size())))) {
                UUID id = profile.getUser().getId();
                String fullName = String.join(" ", Arrays.asList(profile.getSurname(), profile.getFirstName(), profile.getPatronymic())
                        .stream().filter(Objects::nonNull).filter(s -> !s.isBlank()).toList());
                add(names, fullName.isBlank() ? profile.getFullName() : fullName, id);
            }
        }
        return new Directory(byId, names, phoneIds, phones);
    }

    private static void add(Map<String, Set<UUID>> index, String value, UUID id) {
        if (value != null && !value.isBlank()) index.computeIfAbsent(normalize(value), ignored -> new HashSet<>()).add(id);
    }

    private static String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT).replace('ё', 'е').replace('\u00a0', ' ').replaceAll("\\s+", " ");
    }

    public record Directory(Map<UUID, UserEntity> users, Map<String, Set<UUID>> names,
                            Map<String, Set<UUID>> phoneIds, RussianPhoneNormalizer phones) {
        public UserEntity trainer(GoogleSheetDataParser.PersonRow person) {
            UserEntity user;
            if (!person.userId().isBlank()) {
                try { user = users.get(UUID.fromString(person.userId())); }
                catch (IllegalArgumentException ex) { throw new IllegalArgumentException("Некорректный user_id тренера"); }
            } else {
                String phone = phones.normalize(person.phone()).orElseThrow(() -> new IllegalArgumentException("Некорректный телефон тренера"));
                user = unique(phoneIds.get(normalize(phone)), "тренер " + person.name());
            }
            if (user == null || !user.isTrainer()) throw new IllegalArgumentException("Активный тренер не найден в БД: " + person.name());
            return user;
        }

        public UserEntity student(String name) { return unique(names.get(normalize(name)), "ученик «" + name + "»"); }

        private UserEntity unique(Set<UUID> ids, String context) {
            if (ids == null || ids.isEmpty()) throw new IllegalArgumentException("Не найден " + context);
            if (ids.size() != 1) throw new IllegalArgumentException("Неоднозначный " + context);
            return users.get(ids.iterator().next());
        }
    }
}
