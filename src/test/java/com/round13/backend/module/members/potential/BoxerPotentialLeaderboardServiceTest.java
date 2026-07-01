package com.round13.backend.module.members.potential;

import com.round13.backend.module.members.potential.dto.BoxerPotentialLeaderboardResponse;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BoxerPotentialLeaderboardServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final BoxerPotentialMeasurementRepository measurementRepository = mock(BoxerPotentialMeasurementRepository.class);
    private final BoxerPotentialAccessPolicy accessPolicy = mock(BoxerPotentialAccessPolicy.class);
    private final BoxerPotentialNormResolver normResolver = mock(BoxerPotentialNormResolver.class);
    private final BoxerPotentialCalculationService calculationService = mock(BoxerPotentialCalculationService.class);
    private final BoxerPotentialMapper mapper = mock(BoxerPotentialMapper.class);

    private final BoxerPotentialService service = new BoxerPotentialService(
            userRepository,
            measurementRepository,
            accessPolicy,
            normResolver,
            calculationService,
            mapper
    );

    @Test
    void leaderboardMapsRowsAndUsesBoundedRequestedLimit() {
        UUID actorId = UUID.randomUUID();
        UUID leaderId = UUID.randomUUID();
        UUID runnerUpId = UUID.randomUUID();
        OffsetDateTime measuredAt = OffsetDateTime.parse("2026-07-01T10:00:00Z");

        when(measurementRepository.findLeaderboard(eq(BoxerPotentialNormGroup.FEMALE), org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(List.of(
                        row(leaderId, "leader", "https://cdn.example/leader.png", measuredAt, "91.25"),
                        row(runnerUpId, "runner_up", null, measuredAt.minusDays(1), "83.50")
                ));

        BoxerPotentialLeaderboardResponse response = service.getLeaderboard(actorId, BoxerPotentialNormGroup.FEMALE, 10);

        assertThat(response.normGroup()).isEqualTo("FEMALE");
        assertThat(response.normGroupLabel()).isEqualTo(BoxerPotentialNormGroup.FEMALE.getLabel());
        assertThat(response.items()).hasSize(2);
        assertThat(response.items().getFirst().place()).isEqualTo(1);
        assertThat(response.items().getFirst().memberId()).isEqualTo(leaderId);
        assertThat(response.items().getFirst().nickname()).isEqualTo("leader");
        assertThat(response.items().getFirst().avatarUrl()).isEqualTo("https://cdn.example/leader.png");
        assertThat(response.items().getFirst().potentialScore()).isEqualByComparingTo("91.25");
        assertThat(response.items().get(1).place()).isEqualTo(2);
        assertThat(response.items().get(1).memberId()).isEqualTo(runnerUpId);

        verify(measurementRepository).findLeaderboard(
                eq(BoxerPotentialNormGroup.FEMALE),
                org.mockito.ArgumentMatchers.argThat(pageable -> pageable.getPageSize() == 10 && pageable.getPageNumber() == 0)
        );
    }

    @Test
    void leaderboardCapsOversizedLimitBeforeRepositoryCall() {
        UUID actorId = UUID.randomUUID();

        service.getLeaderboard(actorId, BoxerPotentialNormGroup.CHILD, 10_000);

        verify(measurementRepository).findLeaderboard(
                eq(BoxerPotentialNormGroup.CHILD),
                org.mockito.ArgumentMatchers.argThat(pageable -> pageable.getPageSize() == 100 && pageable.getPageNumber() == 0)
        );
    }

    private BoxerPotentialLeaderboardRow row(
            UUID memberId,
            String nickname,
            String avatarUrl,
            OffsetDateTime measuredAt,
            String potentialScore
    ) {
        BigDecimal score = new BigDecimal(potentialScore);
        return new BoxerPotentialLeaderboardRow(
                memberId,
                nickname,
                avatarUrl,
                measuredAt,
                score,
                score.subtract(new BigDecimal("1.00")),
                score.subtract(new BigDecimal("2.00")),
                score.subtract(new BigDecimal("3.00")),
                score.subtract(new BigDecimal("4.00"))
        );
    }
}
