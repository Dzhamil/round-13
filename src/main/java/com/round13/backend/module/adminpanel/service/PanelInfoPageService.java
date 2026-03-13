package com.round13.backend.module.adminpanel.service;

import com.round13.backend.module.admin.service.AdminInfoPageService;
import com.round13.backend.module.info.dto.InfoPageResponse;
import com.round13.backend.module.info.dto.UpsertInfoPageRequest;
import com.round13.backend.module.info.mapper.InfoPageMapper;
import com.round13.backend.module.info.repo.InfoPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Сервис редактирования информационных страниц в админ-панели.
 */
@Service
@RequiredArgsConstructor
public class PanelInfoPageService {

    private final InfoPageRepository infoPageRepository;
    private final InfoPageMapper infoPageMapper;
    private final AdminInfoPageService adminInfoPageService;

    @Transactional(readOnly = true)
    public InfoPageResponse getByCode(String code) {
        String normalized = normalizeCode(code);

        return infoPageRepository.findById(normalized)
                .map(infoPageMapper::toResponse)
                .orElseGet(() -> new InfoPageResponse(
                        normalized,
                        resolveDefaultTitle(normalized),
                        "",
                        null
                ));
    }

    @Transactional
    public void upsert(String code, UpsertInfoPageRequest request) {
        adminInfoPageService.upsert(code, request);
    }

    private String normalizeCode(String code) {
        if (code == null) {
            return "";
        }
        return code.trim().toLowerCase();
    }

    private String resolveDefaultTitle(String code) {
        return switch (code) {
            case "about" -> "О клубе";
            case "contacts" -> "Контакты";
            case "newcomers" -> "Новичкам";
            default -> code;
        };
    }
}
