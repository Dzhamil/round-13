// src/main/java/com/round13/backend/module/members/mapper/MemberPointsCacheMapper.java
package com.round13.backend.module.members.mapper;

import static org.mapstruct.NullValuePropertyMappingStrategy.IGNORE;
import com.round13.backend.domain.UserStatsEntity;
import com.round13.backend.module.members.dto.MemberPointsCacheUpdate;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

/**
 * MapStruct-маппер для применения рассчитанного кеша к UserStatsEntity.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = IGNORE)
public interface MemberPointsCacheMapper {

    void apply(MemberPointsCacheUpdate update, @MappingTarget UserStatsEntity target);
}
