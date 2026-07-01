package com.round13.backend.module.members.potential;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public interface BoxerPotentialLeaderboardRow {
    UUID getMemberId();
    String getNickname();
    String getAvatarUrl();
    OffsetDateTime getMeasuredAt();
    BigDecimal getPotentialScore();
    BigDecimal getStrengthScore();
    BigDecimal getEnduranceScore();
    BigDecimal getSpeedScore();
    BigDecimal getAgilityScore();
}
