package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.profile.service.ProfileDisplayName;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service @RequiredArgsConstructor
public class AttendanceSheetSyncService {
    private final GoogleSheetSpaceRepository repository;
    private final GoogleSheetsGateway gateway;
    private final ProfileRepository profileRepository;
    public void sync(TrainingSessionEntity training, List<TrainingParticipantEntity> participants, UUID markedBy) {
        Optional<GoogleSheetSpaceEntity> active = repository.findByActiveTrue();
        if (active.isEmpty() || active.get().getCredentialsEnvVar() == null) return;
        Map<UUID, ProfileEntity> profiles = new HashMap<>();
        if (!participants.isEmpty()) {
            Set<UUID> ids = new LinkedHashSet<>();
            ids.add(training.getCoach().getId());
            participants.forEach(p -> ids.add(p.getUser().getId()));
            profileRepository.findByUserIdIn(List.copyOf(ids)).forEach(p -> profiles.put(p.getUser().getId(), p));
        }
        String coachName = participants.isEmpty() ? null : name(training.getCoach(), profiles);
        List<List<Object>> rows = new ArrayList<>();
        for (TrainingParticipantEntity p : participants) rows.add(Arrays.asList(
                training.getStartTime().toLocalDate().toString(), training.getStartTime().toLocalTime().toString(),
                coachName, training.getTitle(), training.getType().name(), name(p.getUser(), profiles),
                value(p.getUser().getPhone()), p.getAttendanceStatus().name(), value(p.getAttendanceComment()),
                value(p.getAttendanceMarkedAt()), value(markedBy), training.getId().toString(), p.getId().toString(),
                p.getAttendanceVersion()));
        gateway.appendRows(active.get(), "Реестр", rows);
    }
    private String name(UserEntity user, Map<UUID, ProfileEntity> profiles) {
        return ProfileDisplayName.resolve(
                profiles.get(user.getId()), user.getNickname(), user.getPhone());
    }
    private Object value(Object v) { return v == null ? "" : v.toString(); }
}
