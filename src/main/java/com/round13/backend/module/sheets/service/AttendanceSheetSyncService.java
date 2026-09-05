package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service @RequiredArgsConstructor
public class AttendanceSheetSyncService {
    private final GoogleSheetSpaceRepository repository;
    private final GoogleSheetsGateway gateway;
    private final ProfileRepository profileRepository;
    private final TrainingSessionRepository sessionRepository;
    private final TrainingParticipantRepository participantRepository;
    public void sync(TrainingSessionEntity training, List<TrainingParticipantEntity> participants, UUID markedBy) {
        Optional<GoogleSheetSpaceEntity> active = repository.findByActiveTrue();
        if (active.isEmpty() || active.get().getCredentialsEnvVar() == null) return;
        List<TrainingSessionEntity> trainings=sessionRepository.findAllSchedule2();
        List<List<Object>> trainingRows=new ArrayList<>();
        trainingRows.add(List.of("training_id","date","start_time","end_time","timezone","trainer_id","trainer_name","location_id","location_name","training_type","title","status","updated_at","version"));
        for(TrainingSessionEntity t:trainings) trainingRows.add(Arrays.asList(t.getId().toString(),t.getStartTime().toLocalDate().toString(),t.getStartTime().toLocalTime().toString(),t.getEndTime().toLocalTime().toString(),t.getTimezone(),t.getCoach().getId().toString(),name(t.getCoach()),"",value(t.getLocation()),t.getType().name(),t.getTitle(),"ACTIVE",value(t.getUpdatedAt()),t.getVersion()));
        gateway.replaceRows(active.get(),"Тренировки",trainingRows);
        List<List<Object>> rows = new ArrayList<>();
        rows.add(List.of("participation_id","training_id","student_id","student_name","attendance_status","attendance_marked_at","attendance_marked_by","comment","updated_at","version"));
        for (TrainingParticipantEntity p : participantRepository.findBySession_IdIn(trainings.stream().map(TrainingSessionEntity::getId).toList())) rows.add(Arrays.asList(p.getId().toString(), p.getSession().getId().toString(), p.getUser().getId().toString(), name(p.getUser()), p.getAttendanceStatus().name(), value(p.getAttendanceMarkedAt()), value(p.getAttendanceMarkedByUserId()), value(p.getAttendanceComment()), value(p.getAttendanceUpdatedAt()), p.getAttendanceVersion()));
        gateway.replaceRows(active.get(), "Участники", rows);
    }
    private String name(UserEntity u) { return profileRepository.findByUserId(u.getId()).map(p -> p.getFullName()==null ? String.join(" ", Arrays.asList(p.getSurname(),p.getFirstName()).stream().filter(Objects::nonNull).toList()) : p.getFullName()).orElse(u.getPhone()); }
    private Object value(Object v) { return v == null ? "" : v.toString(); }
}
