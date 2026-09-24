package com.round13.backend.module.schedule2.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.schedule2.dto.Schedule2Dtos.*;
import com.round13.backend.module.training.repo.TrainingParticipantRepository;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class Schedule2ServiceTest {
    private final TrainingSessionRepository sessions=mock(TrainingSessionRepository.class);
    private final TrainingParticipantRepository participants=mock(TrainingParticipantRepository.class);
    private final UserRepository users=mock(UserRepository.class);
    private final ProfileRepository profiles=mock(ProfileRepository.class);
    private final Schedule2AttendanceCommand command=mock(Schedule2AttendanceCommand.class);
    private final Schedule2AttendanceDelivery sync=mock(Schedule2AttendanceDelivery.class);
    private final Schedule2Service service=new Schedule2Service(sessions,participants,users,new Schedule2QueryService(sessions,participants,profiles),command,sync);

    @Test void rejectsAttendanceForAnotherTrainersTraining(){UUID owner=UUID.randomUUID(),actor=UUID.randomUUID(),id=UUID.randomUUID();when(sessions.findSchedule2ById(id)).thenReturn(Optional.of(training(id,owner)));
        assertThatThrownBy(()->service.applyAttendance(actor,id,new AttendanceRequest(List.of()))).isInstanceOf(ResponseStatusException.class).hasMessageContaining("403");
        verify(sync, never()).deliver(any(), any());
    }

    @Test void failedDbConfirmationNeverAttemptsDelivery() {
        var owner = UUID.randomUUID(); var id = UUID.randomUUID();
        var request = new AttendanceRequest(List.of());
        doThrow(new IllegalStateException("DB commit failure")).when(command).save(owner, id, request);
        assertThatThrownBy(() -> service.applyAttendance(owner, id, request)).hasMessage("DB commit failure");
        verifyNoInteractions(sync);
    }

    @Test void committedSavePrecedesDelivery() {
        var owner = UUID.randomUUID(); var id = UUID.randomUUID();
        when(sessions.findSchedule2ById(id)).thenReturn(Optional.of(training(id, owner)));
        var request = new AttendanceRequest(List.of());
        service.applyAttendance(owner, id, request);
        var order = inOrder(command, sync);
        order.verify(command).save(owner, id, request);
        order.verify(sync).deliver(owner, id);
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(ints = {1, 10, 100})
    void listAndDetailHaveConstantReadCounts(int size) {
        UUID owner = UUID.randomUUID();
        var trainings = java.util.stream.IntStream.range(0, size).mapToObj(i -> training(UUID.randomUUID(), owner)).toList();
        when(sessions.findSchedule2ByCoach(eq(owner), any(), any())).thenReturn(trainings);
        when(participants.countBySessionIds(any())).thenReturn(Collections.singletonList(new Object[]{trainings.getFirst().getId(), 3L}));
        var summaries = service.list(owner, java.time.LocalDate.now(), java.time.LocalDate.now());
        assertThat(summaries).hasSize(size);
        assertThat(summaries.getFirst().participantsCount()).isEqualTo(3);
        assertThat(summaries.getLast().participantsCount()).isEqualTo(size == 1 ? 3 : 0);
        verify(participants).countBySessionIds(any());
        verify(profiles).findByUserIdIn(List.of(owner));
        verifyNoMoreInteractions(participants);
        clearInvocations(profiles, participants);
        var training = trainings.getFirst();
        when(sessions.findSchedule2ById(training.getId())).thenReturn(Optional.of(training));
        var rows = java.util.stream.IntStream.range(0, size).mapToObj(i -> {
            var p = new TrainingParticipantEntity(); var u = new UserEntity();
            u.setId(UUID.randomUUID()); u.setPhone("phone" + i); p.setUser(u); p.setAttendanceVersion(i); return p;
        }).toList();
        when(participants.findSchedule2Participants(training.getId())).thenReturn(rows);
        var detail = service.detail(owner, training.getId());
        assertThat(detail.participants()).extracting(Participant::studentName).containsExactlyElementsOf(
                rows.stream().map(p -> p.getUser().getPhone()).toList());
        assertThat(detail.participants().getLast().version()).isEqualTo(size - 1);
        verify(profiles).findByUserIdIn(argThat(ids -> ids.size() == size + 1));
        verify(profiles, never()).findByUserId(any());
        verify(participants).findSchedule2Participants(training.getId());
        verifyNoMoreInteractions(participants);
    }

    @Test void creationDeduplicatesAndValidatesBeforeSaving() {
        UUID owner = UUID.randomUUID(), studentId = UUID.randomUUID(), missing = UUID.randomUUID();
        var training = training(UUID.randomUUID(), owner);
        var student = new UserEntity(); student.setId(studentId);
        when(users.findByIdWithRole(owner)).thenReturn(Optional.of(training.getCoach()));
        when(users.findAllById(any())).thenReturn(List.of(student));
        var bad = new CreateTrainingRequest(" Test ", TrainingType.GROUP, training.getStartTime(), 60, null, null,
                List.of(studentId, missing));
        assertThatThrownBy(() -> service.create(owner, bad)).isInstanceOf(ResponseStatusException.class).hasMessageContaining("400");
        verifyNoInteractions(sessions, participants);
        when(sessions.save(any())).thenReturn(training);
        when(sessions.findSchedule2ById(training.getId())).thenReturn(Optional.of(training));
        service.create(owner, new CreateTrainingRequest("Test", TrainingType.GROUP, training.getStartTime(), 60, null, null,
                List.of(studentId, studentId)));
        verify(participants).saveAll(argThat(values -> {
            var list = new ArrayList<TrainingParticipantEntity>(); values.forEach(list::add);
            return list.size() == 1 && list.getFirst().getUser() == student
                    && list.getFirst().getAttendanceStatus() == AttendanceStatus.ABSENT;
        }));
        verify(users, never()).findById(any());
    }

    @Test void emptyRangeDoesNotReadProfilesOrCounts() {
        service.list(UUID.randomUUID(), java.time.LocalDate.now(), java.time.LocalDate.now());
        verifyNoInteractions(profiles, participants);
    }

    @Test void emptyCreationAndLegacyNamesRetainDefaults() {
        UUID owner = UUID.randomUUID(); var training = training(UUID.randomUUID(), owner);
        var profile = new ProfileEntity(); profile.setUser(training.getCoach()); profile.setFullName("Legacy Coach");
        when(users.findByIdWithRole(owner)).thenReturn(Optional.of(training.getCoach()));
        when(sessions.save(any())).thenReturn(training);
        when(sessions.findSchedule2ById(training.getId())).thenReturn(Optional.of(training));
        when(profiles.findByUserIdIn(any())).thenReturn(List.of(profile));
        var result = service.create(owner, new CreateTrainingRequest("Test", TrainingType.GROUP, training.getStartTime(), 60, null, null, List.of()));
        assertThat(result.participants()).isEmpty(); assertThat(result.training().participantsCount()).isZero();
        assertThat(result.training().trainerName()).isEqualTo("Legacy Coach");
        profile.setFirstName("First"); profile.setSurname(" ");
        assertThat(service.detail(owner, training.getId()).training().trainerName()).isEqualTo("First");
        verify(users, never()).findAllById(any()); verify(participants, never()).saveAll(any());
    }

    private TrainingSessionEntity training(UUID id,UUID owner){UserEntity coach=new UserEntity();coach.setId(owner);coach.setPhone("coach");TrainingSessionEntity t=new TrainingSessionEntity();t.setId(id);t.setCoach(coach);t.setSchedule2Enabled(true);t.setTitle("Test");t.setType(TrainingType.GROUP);t.setStartTime(OffsetDateTime.now());t.setDurationMinutes(60);return t;}
}
