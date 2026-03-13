package com.round13.backend.module.members.mapper;

import com.round13.backend.domain.TrainingBalanceEventType;
import com.round13.backend.module.members.dto.TrainingBalanceChangeCommand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.UUID;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TrainingBalanceChangeCommandMapper {

    @Mapping(target = "trainerId", source = "trainerId")
    @Mapping(target = "studentId", source = "studentId")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "eventType", source = "eventType")
    @Mapping(target = "createdByUserId", source = "createdByUserId")
    TrainingBalanceChangeCommand toCommand(
            UUID trainerId,
            UUID studentId,
            int quantity,
            TrainingBalanceEventType eventType,
            UUID createdByUserId
    );
}
