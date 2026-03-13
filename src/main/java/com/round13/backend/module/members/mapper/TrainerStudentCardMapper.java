package com.round13.backend.module.members.mapper;

import com.round13.backend.domain.TrainingParticipantEntity;
import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.module.members.dto.StudentOperationalStatusResponse;
import com.round13.backend.module.members.dto.StudentTrainingActivityResponse;
import com.round13.backend.module.members.dto.TrainerStudentCardResponse;
import com.round13.backend.module.members.dto.TrainerStudentNoteResponse;
import com.round13.backend.module.members.dto.TrainingBalanceHistoryItemResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface TrainerStudentCardMapper {

    @Mapping(target = "note", source = "link.coachNote")
    @Mapping(target = "updatedAt", source = "link.coachNoteUpdatedAt")
    @Mapping(target = "updatedByUserId", expression = "java(toStringId(link.getCoachNoteUpdatedByUserId()))")
    @Mapping(target = "updatedByName", source = "updatedByName")
    TrainerStudentNoteResponse toNote(UserTrainerLinkEntity link, String updatedByName);

    @Mapping(target = "id", expression = "java(participant.getSession().getId().toString())")
    @Mapping(target = "title", expression = "java(participant.getSession().getTitle())")
    @Mapping(target = "startTime", expression = "java(participant.getSession().getStartTime())")
    @Mapping(target = "durationMinutes", expression = "java(participant.getSession().getDurationMinutes())")
    @Mapping(target = "location", expression = "java(participant.getSession().getLocation())")
    @Mapping(target = "participantStatus", expression = "java(participant.getStatus() == null ? null : participant.getStatus().name())")
    StudentTrainingActivityResponse toTrainingItem(TrainingParticipantEntity participant);

    @Mapping(target = "operationalStatus", source = "operationalStatus")
    @Mapping(target = "trainerNote", source = "note")
    @Mapping(target = "nextTraining", source = "nextTraining")
    @Mapping(target = "recentTrainings", source = "recentTrainings")
    @Mapping(target = "recentBalanceChanges", source = "recentBalanceChanges")
    TrainerStudentCardResponse toCard(
            StudentOperationalStatusResponse operationalStatus,
            TrainerStudentNoteResponse note,
            StudentTrainingActivityResponse nextTraining,
            List<StudentTrainingActivityResponse> recentTrainings,
            List<TrainingBalanceHistoryItemResponse> recentBalanceChanges
    );

    default String toStringId(UUID value) {
        return value == null ? null : value.toString();
    }
}
