package com.round13.backend.module.schedule2.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.info.repo.TrainingSessionRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.schedule2.dto.Schedule2Dtos.*;
import com.round13.backend.module.sheets.service.AttendanceSheetSyncService;
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
    private final AttendanceSheetSyncService sync=mock(AttendanceSheetSyncService.class);
    private final Schedule2Service service=new Schedule2Service(sessions,participants,users,profiles,sync);

    @Test void rejectsAttendanceForAnotherTrainersTraining(){UUID owner=UUID.randomUUID(),actor=UUID.randomUUID(),id=UUID.randomUUID();when(sessions.findSchedule2ById(id)).thenReturn(Optional.of(training(id,owner)));
        assertThatThrownBy(()->service.applyAttendance(actor,id,new AttendanceRequest(List.of()))).isInstanceOf(ResponseStatusException.class).hasMessageContaining("403");
        verifyNoInteractions(sync);
    }

    @Test void persistsWholeAttendanceBatchAndSyncsOnlyOnApply(){UUID owner=UUID.randomUUID(),id=UUID.randomUUID(),student=UUID.randomUUID(),participation=UUID.randomUUID();TrainingSessionEntity training=training(id,owner);TrainingParticipantEntity p=new TrainingParticipantEntity();p.setId(participation);p.setSession(training);UserEntity u=new UserEntity();u.setId(student);u.setPhone("+79990001122");p.setUser(u);p.setAttendanceStatus(AttendanceStatus.ABSENT);when(sessions.findSchedule2ById(id)).thenReturn(Optional.of(training));when(participants.findSchedule2Participants(id)).thenReturn(List.of(p));when(participants.countBySession_Id(id)).thenReturn(1L);
        service.applyAttendance(owner,id,new AttendanceRequest(List.of(new AttendanceItem(participation,AttendanceStatus.PRESENT,null,0))));
        assertThat(p.getAttendanceStatus()).isEqualTo(AttendanceStatus.PRESENT);assertThat(p.getAttendanceVersion()).isEqualTo(1);verify(participants).save(p);verify(sync).sync(eq(training),anyList(),eq(owner));
    }
    private TrainingSessionEntity training(UUID id,UUID owner){UserEntity coach=new UserEntity();coach.setId(owner);coach.setPhone("coach");TrainingSessionEntity t=new TrainingSessionEntity();t.setId(id);t.setCoach(coach);t.setSchedule2Enabled(true);t.setTitle("Test");t.setType(TrainingType.GROUP);t.setStartTime(OffsetDateTime.now());t.setDurationMinutes(60);return t;}
}
