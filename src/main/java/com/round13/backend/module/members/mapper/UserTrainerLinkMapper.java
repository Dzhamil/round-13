package com.round13.backend.module.members.mapper;

import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.module.members.dto.TrainingBalanceChangeCommand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserTrainerLinkMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "trainerId", source = "trainerId")
    @Mapping(target = "studentId", source = "studentId")
    @Mapping(target = "remainingTrainings", constant = "0")
    @Mapping(target = "createdAt", ignore = true)
    UserTrainerLinkEntity create(java.util.UUID trainerId, java.util.UUID studentId);

    default UserTrainerLinkEntity create(TrainingBalanceChangeCommand command) {
        return create(command.trainerId(), command.studentId());
    }
}
