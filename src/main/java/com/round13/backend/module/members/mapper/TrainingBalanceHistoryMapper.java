package com.round13.backend.module.members.mapper;

import com.round13.backend.module.members.dto.TrainingBalanceHistoryItemResponse;
import com.round13.backend.module.members.dto.TrainingBalanceHistoryItemRow;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface TrainingBalanceHistoryMapper {

    @Mapping(target = "id", expression = "java(row.id() == null ? null : row.id().toString())")
    @Mapping(target = "studentId", expression = "java(row.studentId() == null ? null : row.studentId().toString())")
    @Mapping(target = "studentName", expression = "java(row.studentName())")
    @Mapping(target = "delta", expression = "java(row.delta() == null ? 0 : row.delta())")
    @Mapping(target = "balanceAfter", expression = "java(row.balanceAfter() == null ? 0 : row.balanceAfter())")
    @Mapping(target = "eventType", expression = "java(row.eventType() == null ? null : row.eventType().name())")
    @Mapping(target = "createdByUserId", expression = "java(row.createdByUserId() == null ? null : row.createdByUserId().toString())")
    @Mapping(target = "createdByName", expression = "java(row.createdByName())")
    @Mapping(target = "createdAt", expression = "java(row.createdAt())")
    TrainingBalanceHistoryItemResponse toItem(TrainingBalanceHistoryItemRow row);
}
