package com.round13.backend.module.rule.mapper;

import com.round13.backend.domain.RuleEntity;
import com.round13.backend.module.admin.dto.AdminRuleResponse;
import com.round13.backend.module.rule.dto.RuleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Маппер правил клуба.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RuleMapper {

    /**
     * Преобразует сущность правила в публичный DTO.
     */
    @Mapping(target = "code", source = "code")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "content", source = "content")
    @Mapping(target = "sortOrder", source = "sortOrder")
    RuleResponse toResponse(RuleEntity entity);

    /**
     * Преобразует сущность правила в административный DTO.
     */
    AdminRuleResponse toAdminResponse(RuleEntity entity);

    /**
     * Преобразует список сущностей правил в список DTO.
     */
    List<RuleResponse> toResponseList(List<RuleEntity> entities);

    List<AdminRuleResponse> toAdminResponseList(List<RuleEntity> entities);
}
