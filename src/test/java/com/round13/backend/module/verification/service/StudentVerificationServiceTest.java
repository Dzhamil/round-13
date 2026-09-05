package com.round13.backend.module.verification.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.module.verification.dto.VerificationDtos.ReviewRequest;
import com.round13.backend.module.verification.repo.StudentVerificationRequestRepository;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class StudentVerificationServiceTest {
    @Test void approvalCreatesTrainerStudentRelationshipAndVerifiesParticipant(){var requests=mock(StudentVerificationRequestRepository.class);var links=mock(UserTrainerLinkRepository.class);var users=mock(UserRepository.class);var profiles=mock(ProfileRepository.class);var service=new StudentVerificationService(requests,links,users,profiles);UUID trainerId=UUID.randomUUID(),studentId=UUID.randomUUID(),requestId=UUID.randomUUID();StudentVerificationRequestEntity request=new StudentVerificationRequestEntity();request.setId(requestId);request.setTrainerId(trainerId);request.setStudentId(studentId);request.setTrainingTypes("GROUP,PERSONAL");request.setStatus(VerificationStatus.PENDING);UserEntity trainer=user(trainerId,"COACH"),student=user(studentId,"ATHLETE");when(requests.findById(requestId)).thenReturn(Optional.of(request));when(users.findById(studentId)).thenReturn(Optional.of(student));when(users.findById(trainerId)).thenReturn(Optional.of(trainer));when(links.findByTrainerIdAndStudentId(trainerId,studentId)).thenReturn(Optional.empty());
        service.review(trainerId,requestId,new ReviewRequest(true,true));
        assertThat(request.getStatus()).isEqualTo(VerificationStatus.APPROVED);assertThat(student.isPhoneVerifiedByStaff()).isTrue();verify(links).save(argThat(link->link.getStudentId().equals(studentId)&&link.getTrainingTypes().contains("PERSONAL")));
    }
    private UserEntity user(UUID id,String roleCode){RoleEntity role=new RoleEntity();role.setCode(roleCode);UserEntity u=new UserEntity();u.setId(id);u.setRole(role);u.setPhone(roleCode);return u;}
}
