package com.round13.backend.module.info.repo;

import com.round13.backend.domain.InfoPageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Репозиторий для информационных страниц.
 */
public interface InfoPageRepository extends JpaRepository<InfoPageEntity, String> {

}
