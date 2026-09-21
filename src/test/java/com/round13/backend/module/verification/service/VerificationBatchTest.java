package com.round13.backend.module.verification.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.module.verification.dto.VerificationDtos.*;
import com.round13.backend.module.verification.repo.StudentVerificationRequestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class VerificationBatchTest {
    final StudentVerificationRequestRepository requests = mock(StudentVerificationRequestRepository.class);
    final UserRepository users = mock(UserRepository.class);
    final ProfileRepository profiles = mock(ProfileRepository.class);
    final StudentVerificationService service = new StudentVerificationService(requests, mock(UserTrainerLinkRepository.class), users, profiles);

    @ParameterizedTest @ValueSource(ints = {1, 10, 100})
    void listsBatchRepeatedIdentitiesAndRetainPrivacy(int size) {
        var student = user("ATHLETE"); student.setPhoneHidden(true);
        var trainer = user("COACH");
        var rows = new ArrayList<StudentVerificationRequestEntity>();
        for (int i = 0; i < size; i++) {
            var row = new StudentVerificationRequestEntity(); row.setId(UUID.randomUUID());
            row.setStudentId(student.getId()); row.setTrainerId(trainer.getId());
            row.setTrainingTypes("GROUP"); row.setStatus(VerificationStatus.PENDING); rows.add(row);
        }
        when(requests.findByStudentIdOrderByCreatedAtDesc(student.getId())).thenReturn(rows);
        when(requests.findByTrainerIdAndStatusOrderByCreatedAtAsc(trainer.getId(), VerificationStatus.PENDING)).thenReturn(rows);
        when(users.findAllById(any())).thenReturn(List.of(student, trainer));
        when(users.findByIdWithRole(trainer.getId())).thenReturn(Optional.of(trainer));
        var mine = service.mine(student.getId());
        assertThat(mine).extracting(RequestResponse::id).containsExactlyElementsOf(rows.stream().map(StudentVerificationRequestEntity::getId).toList());
        assertThat(mine.getFirst().studentName()).isEqualTo("Без имени");
        assertThat(service.incoming(trainer.getId())).isEqualTo(mine);
        verify(users, times(2)).findAllById(argThat(ids -> ((Collection<?>) ids).size() == 2));
        verify(profiles, times(2)).findByUserIdIn(any());
        verify(users, never()).findById(any()); verify(profiles, never()).findByUserId(any());
    }

    @Test void submitRetainsDuplicateResponseSnapshotsAndResetsReview() {
        var student = readyStudent(); var trainer = user("COACH");
        when(users.findByIdInWithRole(any())).thenReturn(List.of(trainer));
        var existing = new StudentVerificationRequestEntity(); existing.setId(UUID.randomUUID()); existing.setTrainerId(trainer.getId());
        existing.setDataConfirmed(true); existing.setRelationshipConfirmed(true); existing.setReviewedAt(java.time.OffsetDateTime.now());
        when(requests.findByStudentIdAndTrainerIdIn(any(), any())).thenReturn(List.of(existing));
        when(requests.saveAll(any())).thenAnswer(call -> new ArrayList<>((Collection<StudentVerificationRequestEntity>) call.getArgument(0)));
        var result = service.submit(student.getId(), new SubmitRequest(List.of(
                new Selection(trainer.getId(), Set.of(" group ")), new Selection(trainer.getId(), Set.of("PERSONAL")))));
        assertThat(result).hasSize(2);
        assertThat(result.getFirst().trainingTypes()).containsExactly("GROUP");
        assertThat(result.getLast().trainingTypes()).containsExactly("PERSONAL");
        assertThat(result).allSatisfy(r -> { assertThat(r.id()).isEqualTo(existing.getId());
            assertThat(r.status()).isEqualTo(VerificationStatus.PENDING); assertThat(r.dataConfirmed()).isFalse();
            assertThat(r.relationshipConfirmed()).isFalse(); assertThat(r.reviewedAt()).isNull(); });
        verify(users).findByIdInWithRole(List.of(trainer.getId()));
        verify(requests).findByStudentIdAndTrainerIdIn(student.getId(), List.of(trainer.getId()));
        verify(requests).saveAll(argThat(rows -> ((Collection<?>) rows).size() == 1));
        verify(requests).flush();
        verify(requests, never()).findByStudentIdAndTrainerId(any(), any());
        verify(profiles).findByUserIdIn(any());
    }

    @ParameterizedTest @ValueSource(ints = {1, 10, 100})
    void submissionReadsAreIndependentOfSelectionCount(int size) {
        var student = readyStudent();
        var trainers = java.util.stream.IntStream.range(0, size).mapToObj(i -> user("COACH")).toList();
        when(users.findByIdInWithRole(any())).thenReturn(trainers);
        when(requests.saveAll(any())).thenAnswer(call -> new ArrayList<>((Collection<StudentVerificationRequestEntity>) call.getArgument(0)));
        var result = service.submit(student.getId(), new SubmitRequest(trainers.stream()
                .map(t -> new Selection(t.getId(), Set.of("GROUP"))).toList()));
        assertThat(result).extracting(RequestResponse::trainerId).containsExactlyElementsOf(trainers.stream().map(UserEntity::getId).toList());
        verify(users).findByIdInWithRole(any()); verify(users).findById(student.getId());
        verify(profiles).findByUserId(student.getId()); verify(profiles).findByUserIdIn(any());
        verify(requests).findByStudentIdAndTrainerIdIn(eq(student.getId()), any());
        verify(requests, never()).findByStudentIdAndTrainerId(any(), any());
    }

    @Test void lateInvalidTrainerOrTypeWritesNothing() {
        var student = readyStudent(); var trainer = user("COACH"); var invalid = user("ATHLETE");
        when(users.findByIdInWithRole(any())).thenReturn(List.of(trainer, invalid));
        for (var selection : List.of(new Selection(UUID.randomUUID(), Set.of("GROUP")),
                new Selection(invalid.getId(), Set.of("GROUP")), new Selection(trainer.getId(), Set.of("BAD")))) {
            assertThatThrownBy(() -> service.submit(student.getId(), new SubmitRequest(List.of(
                    new Selection(trainer.getId(), Set.of("GROUP")), selection)))).isInstanceOf(ResponseStatusException.class);
        }
        verifyNoInteractions(requests);
    }

    @Test void trainerOptionsBatchOnlyEligibleUsersAndEmptyListsDoNotEnrich() {
        var trainer = user("COACH"); var admin = user("ADMIN");
        when(users.findAllWithRole()).thenReturn(List.of(trainer, user("ATHLETE"), admin));
        assertThat(service.trainers()).extracting(TrainerOption::id).containsExactly(trainer.getId(), admin.getId());
        verify(profiles).findByUserIdIn(List.of(trainer.getId(), admin.getId()));
        clearInvocations(profiles, users);
        assertThat(service.mine(UUID.randomUUID())).isEmpty();
        verifyNoInteractions(profiles, users);
    }

    UserEntity readyStudent() {
        var student = user("ATHLETE"); var profile = new ProfileEntity(); profile.setUser(student);
        profile.setSurname("Surname"); profile.setFirstName("Name");
        when(profiles.findByUserId(student.getId())).thenReturn(Optional.of(profile));
        when(users.findById(student.getId())).thenReturn(Optional.of(student)); return student;
    }
    UserEntity user(String code) { var user = new UserEntity(); user.setId(UUID.randomUUID()); user.setPhone("phone");
        var role = new RoleEntity(); role.setCode(code); user.setRole(role); return user; }
}
