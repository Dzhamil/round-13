package com.round13.backend.module.info.repo;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class TrainingSessionRepositoryTest {

    @Test
    void coachSchedulesUseMutuallyExclusiveScheduleVersions() throws NoSuchMethodException {
        Query oldScheduleQuery = queryFor(
                "findCoachSchedule",
                UUID.class,
                OffsetDateTime.class,
                OffsetDateTime.class
        );
        Query schedule2Query = queryFor(
                "findSchedule2ByCoach",
                UUID.class,
                OffsetDateTime.class,
                OffsetDateTime.class
        );

        assertThat(oldScheduleQuery.value()).contains("s.schedule2Enabled = false");
        assertThat(schedule2Query.value()).contains("s.schedule2Enabled = true");
    }

    private Query queryFor(String methodName, Class<?>... parameterTypes) throws NoSuchMethodException {
        return TrainingSessionRepository.class
                .getMethod(methodName, parameterTypes)
                .getAnnotation(Query.class);
    }
}
