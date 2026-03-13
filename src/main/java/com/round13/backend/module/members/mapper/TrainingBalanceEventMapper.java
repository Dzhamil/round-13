package com.round13.backend.module.members.mapper;

import com.round13.backend.domain.TrainingBalanceEventEntity;
import com.round13.backend.module.members.dto.TrainingBalanceChangeCommand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TrainingBalanceEventMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "trainerId", source = "command.trainerId")
    @Mapping(target = "studentId", source = "command.studentId")
    @Mapping(target = "delta", source = "delta")
    @Mapping(target = "balanceAfter", source = "balanceAfter")
    @Mapping(target = "eventType", source = "command.eventType")
    @Mapping(target = "createdByUserId", source = "command.createdByUserId")
    @Mapping(target = "createdAt", ignore = true)
    TrainingBalanceEventEntity toEntity(TrainingBalanceChangeCommand command, int delta, int balanceAfter);
}
