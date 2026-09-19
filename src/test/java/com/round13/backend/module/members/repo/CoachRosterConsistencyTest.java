package com.round13.backend.module.members.repo;

import com.round13.backend.domain.*;
import com.round13.backend.module.adminpanel.service.PanelUsersService;
import com.round13.backend.module.members.dto.MemberListItemRow;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.sheets.sync.CoachSheetChanges;
import com.round13.backend.module.user.repo.*;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Query;
import java.util.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class CoachRosterConsistencyTest {
    @Test
    void actualDatabaseQueriesAndPanelAgreeAcrossRolesStatusesAndMissingProfiles() throws Exception {
        try (SessionFactory factory = new Configuration()
                .addAnnotatedClass(UserEntity.class).addAnnotatedClass(RoleEntity.class)
                .addAnnotatedClass(ProfileEntity.class).addAnnotatedClass(UserStatsEntity.class)
                .setProperty("hibernate.connection.driver_class", "org.h2.Driver")
                .setProperty("hibernate.connection.url", "jdbc:h2:mem:coach-roster;MODE=PostgreSQL")
                .setProperty("hibernate.hbm2ddl.auto", "create-drop").buildSessionFactory();
             Session session = factory.openSession()) {
            session.beginTransaction();
            for (String code : List.of("COACH", "ADMIN", "ATHLETE", "LEGACY")) {
                var role = new RoleEntity(); role.setCode(code); session.persist(role);
                for (UserStatus status : UserStatus.values()) {
                    var user = new UserEntity(); user.setRole(role); user.setStatus(status); session.persist(user);
                }
            }
            session.flush(); session.clear();
            String membersQuery = MembersReadRepository.class.getMethod("findCoaches").getAnnotation(Query.class).value();
            var app = session.createQuery(membersQuery, MemberListItemRow.class).getResultList();
            String panelQuery = UserRepository.class.getMethod("findAllWithRole").getAnnotation(Query.class).value();
            var databaseUsers = session.createQuery(panelQuery, UserEntity.class).getResultList();
            var users = mock(UserRepository.class);
            when(users.findAllWithRole()).thenReturn(databaseUsers);
            var panel = new PanelUsersService(users, mock(RoleRepository.class), mock(ProfileRepository.class), mock(CoachSheetChanges.class));
            var panelCoaches = panel.getUsers().stream().filter(item -> item.isCoach()).map(item -> item.getId()).toList();
            assertThat(panelCoaches).hasSize(2 * (UserStatus.values().length - 1));
            assertThat(panelCoaches).containsExactlyInAnyOrderElementsOf(app.stream().map(MemberListItemRow::id).toList());
            session.getTransaction().rollback();
        }
    }
}
