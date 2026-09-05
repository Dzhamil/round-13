package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
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
        List<List<Object>> rows = new ArrayList<>();
        for (TrainingParticipantEntity p : participants) rows.add(Arrays.asList(
                training.getStartTime().toLocalDate().toString(), training.getStartTime().toLocalTime().toString(),
                name(training.getCoach()), training.getTitle(), training.getType().name(), name(p.getUser()),
                value(p.getUser().getPhone()), p.getAttendanceStatus().name(), value(p.getAttendanceComment()),
                value(p.getAttendanceMarkedAt()), value(markedBy), training.getId().toString(), p.getId().toString(),
                p.getAttendanceVersion()));
        gateway.appendRows(active.get(), "Реестр", rows);
    }
    private String name(UserEntity u) { return profileRepository.findByUserId(u.getId()).map(p -> p.getFullName()==null ? String.join(" ", Arrays.asList(p.getSurname(),p.getFirstName()).stream().filter(Objects::nonNull).toList()) : p.getFullName()).orElse(u.getPhone()); }
    private Object value(Object v) { return v == null ? "" : v.toString(); }
}
