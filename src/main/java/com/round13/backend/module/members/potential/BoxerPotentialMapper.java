package com.round13.backend.module.members.potential;

import com.round13.backend.module.members.potential.dto.BoxerPotentialCharacteristicScoresResponse;
import com.round13.backend.module.members.potential.dto.BoxerPotentialChartPointResponse;
import com.round13.backend.module.members.potential.dto.BoxerPotentialMeasurementResponse;
import com.round13.backend.module.members.potential.dto.BoxerPotentialRawValuesResponse;
import com.round13.backend.module.members.potential.dto.BoxerPotentialTestScoresResponse;
import org.springframework.stereotype.Component;

@Component
public class BoxerPotentialMapper {

    public BoxerPotentialMeasurementResponse toResponse(BoxerPotentialMeasurementEntity entity) {
        return new BoxerPotentialMeasurementResponse(
                entity.getId(),
                entity.getMember().getId(),
                entity.getMeasuredAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedByUser().getId(),
                entity.getCreatedByUser().getNickname(),
                entity.getUpdatedByUser() == null ? null : entity.getUpdatedByUser().getId(),
                entity.getUpdatedByUser() == null ? null : entity.getUpdatedByUser().getNickname(),
                entity.getNormGroup().name(),
                entity.getNormGroup().getLabel(),
                entity.getNormSet().name(),
                entity.getAgeAtMeasurement(),
                entity.getGenderAtMeasurement(),
                new BoxerPotentialRawValuesResponse(
                        entity.getPushUps90Sec(),
                        entity.getPullUps(),
                        entity.getJumpSquats90Sec(),
                        entity.getPunchForceKg(),
                        entity.getBurpees5Min(),
                        entity.getPunches20Sec(),
                        entity.getRopeJumps60Sec(),
                        entity.getDoubleUnders60Sec()
                ),
                new BoxerPotentialTestScoresResponse(
                        entity.getPushUpsScore(),
                        entity.getPullUpsScore(),
                        entity.getJumpSquatsScore(),
                        entity.getPunchForceScore(),
                        entity.getBurpeesScore(),
                        entity.getPunchesScore(),
                        entity.getRopeJumpsScore(),
                        entity.getDoubleUndersScore()
                ),
                new BoxerPotentialCharacteristicScoresResponse(
                        entity.getStrengthScore(),
                        entity.getEnduranceScore(),
                        entity.getSpeedScore(),
                        entity.getAgilityScore()
                ),
                entity.getPotentialScore()
        );
    }

    public BoxerPotentialChartPointResponse toChartPoint(BoxerPotentialMeasurementEntity entity) {
        return new BoxerPotentialChartPointResponse(
                entity.getMeasuredAt(),
                entity.getPotentialScore(),
                entity.getStrengthScore(),
                entity.getEnduranceScore(),
                entity.getSpeedScore(),
                entity.getAgilityScore()
        );
    }
}
