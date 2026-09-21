package com.round13.backend.module.verification.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.*;
import com.round13.backend.module.verification.dto.VerificationDtos.*;
import com.round13.backend.module.verification.repo.StudentVerificationRequestRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import java.util.*;
import static org.assertj.core.api.Assertions.*;

@DataJpaTest(showSql = false, properties = {"spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.generate_statistics=true", "logging.level.org.hibernate.stat=OFF",
        "logging.level.org.hibernate.engine.internal.StatisticalLoggingSessionEventListener=OFF"})
@Import(StudentVerificationService.class)
class VerificationBatchIntegrationTest {
    @Autowired EntityManager em;
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @Autowired ProfileRepository profiles;
    @Autowired StudentVerificationService verification;
    @Autowired StudentVerificationRequestRepository requests;

    @Test void duplicateSubmissionUsesOneDatabaseRowAndRetainsBothSnapshots() {
        var student = user("ATHLETE"); var trainer = user("COACH"); em.flush(); em.clear();
        var result = verification.submit(student.getId(), new SubmitRequest(List.of(
                new Selection(trainer.getId(), Set.of("GROUP")), new Selection(trainer.getId(), Set.of("PERSONAL")))));
        em.flush(); em.clear();
        assertThat(result.getFirst().id()).isEqualTo(result.getLast().id()).isNotNull();
        assertThat(result.getFirst().createdAt()).isNotNull();
        assertThat(result.getFirst().trainingTypes()).containsExactly("GROUP");
        assertThat(result.getLast().trainingTypes()).containsExactly("PERSONAL");
        assertThat(requests.findByStudentIdOrderByCreatedAtDesc(student.getId())).singleElement()
                .satisfies(r -> assertThat(r.getTrainingTypes()).isEqualTo("PERSONAL"));
    }

    @Test void batchedTrainerOptionsPreserveCurrentDeletedUserFilters() {
        var visible = user("COACH");
        var deleted = user("COACH"); deleted.setStatus(UserStatus.DELETED);
        var permanentlyDeleted = user("COACH"); permanentlyDeleted.setPermanentlyDeleted(true);
        em.flush(); em.clear();

        assertThat(verification.trainers()).extracting(TrainerOption::id).containsExactly(visible.getId());
        assertThat(users.findUserProfileBundle(deleted.getId())).isEmpty();
        assertThat(users.findUserProfileBundle(permanentlyDeleted.getId())).isEmpty();
    }

    UserEntity user(String code) {
        var role = roles.findByCode(code).orElseGet(() -> { var r = new RoleEntity(); r.setCode(code); return roles.save(r); });
        var user = new UserEntity(); user.setRole(role); user.setStatus(UserStatus.ACTIVE); user.setNickname(UUID.randomUUID().toString()); user = users.save(user);
        var profile = new ProfileEntity(); profile.setUser(user); profile.setSurname("Last"); profile.setFirstName("First"); profiles.save(profile);
        return user;
    }
}
