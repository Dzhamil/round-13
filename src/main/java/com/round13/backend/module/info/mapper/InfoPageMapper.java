package com.round13.backend.module.info.mapper;

import com.round13.backend.domain.InfoPageEntity;
import com.round13.backend.module.info.dto.UpsertInfoPageRequest;
import com.round13.backend.module.info.dto.InfoPageResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper для информационных страниц.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InfoPageMapper {

    InfoPageResponse toResponse(InfoPageEntity entity);

    void update(UpsertInfoPageRequest request, @MappingTarget InfoPageEntity entity);

    /**
     * Создаёт новую страницу с заданным code и данными запроса.
     */
    @Mapping(target = "code", source = "code")
    InfoPageEntity create(String code, UpsertInfoPageRequest request);
}
