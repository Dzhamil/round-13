package com.round13.backend.module.info.service;

import com.round13.backend.domain.InfoPageEntity;
import com.round13.backend.module.info.dto.InfoPageResponse;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.info.mapper.InfoPageMapper;
import com.round13.backend.module.info.repo.InfoPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Публичный сервис информационных страниц.
 */
@Service
@RequiredArgsConstructor
public class InfoPageService {

    private final InfoPageRepository infoPageRepository;
    private final InfoPageMapper infoPageMapper;

    @Transactional(readOnly = true)
    public InfoPageResponse getByCode(String code) {
        String normalized = normalizeCode(code);

        InfoPageEntity entity = infoPageRepository.findById(normalized)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAGE_NOT_FOUND));

        return infoPageMapper.toResponse(entity);
    }

    private String normalizeCode(String code) {
        if (code == null) return "";
        return code.trim().toLowerCase();
    }
}
