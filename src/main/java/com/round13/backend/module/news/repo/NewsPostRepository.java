package com.round13.backend.module.news.repo;

import com.round13.backend.domain.NewsPostEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Репозиторий новостей клуба.
 */
public interface NewsPostRepository extends JpaRepository<NewsPostEntity, UUID> {

    Page<NewsPostEntity> findAllByPublishedTrue(Pageable pageable);
}
