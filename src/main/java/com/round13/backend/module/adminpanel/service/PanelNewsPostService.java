package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.NewsPostEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.news.dto.AdminNewsPostResponse;
import com.round13.backend.module.news.dto.UpsertNewsPostRequest;
import com.round13.backend.module.news.mapper.NewsPostMapper;
import com.round13.backend.module.news.repo.NewsPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Сервис управления новостями клуба в админ-панели.
 */
@Service
@RequiredArgsConstructor
public class PanelNewsPostService {

    private final NewsPostRepository newsPostRepository;
    private final NewsPostMapper newsPostMapper;

    @Transactional(readOnly = true)
    public List<AdminNewsPostResponse> getAll() {
        Sort sort = Sort.by(
                Sort.Order.desc("published"),
                Sort.Order.desc("publishedAt"),
                Sort.Order.desc("updatedAt")
        );
        return newsPostMapper.toAdminResponseList(newsPostRepository.findAll(sort));
    }

    @Transactional(readOnly = true)
    public AdminNewsPostResponse getById(UUID id) {
        return newsPostMapper.toAdminResponse(findById(id));
    }

    @Transactional
    public UUID create(UpsertNewsPostRequest request) {
        NewsPostEntity entity = new NewsPostEntity();
        applyRequest(entity, request);
        newsPostRepository.save(entity);
        return entity.getId();
    }

    @Transactional
    public void update(UUID id, UpsertNewsPostRequest request) {
        NewsPostEntity entity = findById(id);
        applyRequest(entity, request);
        newsPostRepository.save(entity);
    }

    @Transactional
    public void delete(UUID id) {
        NewsPostEntity entity = findById(id);
        newsPostRepository.delete(entity);
    }

    private NewsPostEntity findById(UUID id) {
        return newsPostRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEWS_POST_NOT_FOUND));
    }

    private void applyRequest(NewsPostEntity entity, UpsertNewsPostRequest request) {
        entity.setTitle(normalizeRequired(request.getTitle()));
        entity.setExcerpt(normalizeOptional(request.getExcerpt()));
        entity.setContent(normalizeRequired(request.getContent()));
        entity.setPublished(Boolean.TRUE.equals(request.getPublished()));
        entity.setPublishedAt(resolvePublishedAt(entity, request));
    }

    private OffsetDateTime resolvePublishedAt(NewsPostEntity entity, UpsertNewsPostRequest request) {
        if (!Boolean.TRUE.equals(request.getPublished())) {
            return null;
        }

        if (request.getPublishedAt() != null) {
            return request.getPublishedAt();
        }

        if (entity.getPublishedAt() != null) {
            return entity.getPublishedAt();
        }

        return OffsetDateTime.now();
    }

    private String normalizeRequired(String value) {
        String normalized = normalizeOptional(value);
        return normalized == null ? "" : normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
