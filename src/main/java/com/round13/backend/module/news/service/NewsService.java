package com.round13.backend.module.news.service;

import com.round13.backend.module.news.dto.NewsPostResponse;
import com.round13.backend.module.news.mapper.NewsPostMapper;
import com.round13.backend.module.news.repo.NewsPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Публичный сервис новостей клуба.
 */
@Service
@RequiredArgsConstructor
public class NewsService {

    private static final int DEFAULT_LIMIT = 6;
    private static final int MAX_LIMIT = 20;

    private final NewsPostRepository newsPostRepository;
    private final NewsPostMapper newsPostMapper;

    @Transactional(readOnly = true)
    public List<NewsPostResponse> getLatest(Integer limit) {
        int resolvedLimit = DEFAULT_LIMIT;
        if (limit != null) {
            resolvedLimit = Math.max(1, Math.min(limit, MAX_LIMIT));
        }

        PageRequest pageRequest = PageRequest.of(
                0,
                resolvedLimit,
                Sort.by(
                        Sort.Order.desc("publishedAt"),
                        Sort.Order.desc("updatedAt")
                )
        );

        return newsPostMapper.toPublicResponseList(
                newsPostRepository.findAllByPublishedTrue(pageRequest).getContent()
        );
    }
}
