package com.round13.backend.module.members.potential.dto;

import java.util.List;

public record BoxerPotentialLeaderboardResponse(
        String normGroup,
        String normGroupLabel,
        List<BoxerPotentialLeaderboardItemResponse> items
) {}
