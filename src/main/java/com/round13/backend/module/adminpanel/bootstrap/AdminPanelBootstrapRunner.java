package com.round13.backend.module.adminpanel.bootstrap;

import com.round13.backend.domain.AdminAccountEntity;
import com.round13.backend.module.adminpanel.repo.AdminAccountRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@RequiredArgsConstructor
public class AdminPanelBootstrapRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminPanelBootstrapRunner.class);

    private final AdminAccountRepository adminAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @Transactional
    public ApplicationRunner bootstrapAdmin() {
        return args -> {

            String login = "round13admin13";
            String password = "round13admin13sparta";

            if (adminAccountRepository.findByLogin(login).isPresent()) {
                log.info("Admin panel bootstrap: admin already exists");
                return;
            }

            AdminAccountEntity admin = new AdminAccountEntity();
            admin.setLogin(login);
            admin.setPasswordHash(passwordEncoder.encode(password));
            admin.setActive(true);

            adminAccountRepository.save(admin);

            log.info("Admin panel bootstrap: admin created");
        };
    }
}
