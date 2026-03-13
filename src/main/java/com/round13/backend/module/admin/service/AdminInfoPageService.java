package com.round13.backend.module.admin.service;

import com.round13.backend.domain.InfoPageEntity;
import com.round13.backend.module.info.dto.UpsertInfoPageRequest;
import com.round13.backend.module.info.mapper.InfoPageMapper;
import com.round13.backend.module.info.repo.InfoPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Сервис администрирования информационных страниц.
 */
@Service
@RequiredArgsConstructor
public class AdminInfoPageService {

    private final InfoPageRepository infoPageRepository;
    private final InfoPageMapper infoPageMapper;

    /**
     * Создаёт страницу по коду, если её нет, иначе обновляет.
     */
    @Transactional
    public void upsert(String code, UpsertInfoPageRequest request) {
        String normalized = normalizeCode(code);

        InfoPageEntity entity = infoPageRepository.findById(normalized)
                .orElse(null);

        if (entity == null) {
            entity = infoPageMapper.create(normalized, request);
        } else {
            infoPageMapper.update(request, entity);
        }

        infoPageRepository.save(entity);
    }

    private String normalizeCode(String code) {
        if (code == null) return "";
        return code.trim().toLowerCase();
    }
}
