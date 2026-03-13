package com.round13.backend.module.admin.mapper;

import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.module.admin.dto.AdminUpdateStatsRequest;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/**
 * Маппер для админской корректировки статистики.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AdminUserStatsMapper {

    /**
     * Обновляет существующую сущность статистики на основе DTO.
     */
    void updateFromDto(AdminUpdateStatsRequest dto, @MappingTarget UserStatsEntity entity);
}
