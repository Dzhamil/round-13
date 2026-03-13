package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.AdminAccountEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.adminpanel.repo.AdminAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * UserDetailsService для админ‑панели. Загружает администратора по логину,
 * проверяет флаг активности и возвращает UserDetails с ролью PANEL_ADMIN.
 */
@Service
@RequiredArgsConstructor
public class AdminPanelUserDetailsService implements UserDetailsService {

    private final AdminAccountRepository adminAccountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminAccountEntity admin = adminAccountRepository.findByLogin(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));
        if (!admin.isActive()) {
            throw new BusinessException(ErrorCode.PANEL_ADMIN_DISABLED);
        }
        return User.withUsername(admin.getId().toString())
                .password(admin.getPasswordHash())
                .roles("PANEL_ADMIN")
                .build();
    }
}
