package com.round13.backend.module.members.potential;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class BoxerPotentialLeaderboardQueryTest {

    @Test
    void leaderboardQueryUsesJpaConstructorProjectionInsteadOfNativeAliasProjection() throws NoSuchMethodException {
        Method method = BoxerPotentialMeasurementRepository.class.getMethod(
                "findLeaderboard",
                BoxerPotentialNormGroup.class,
                org.springframework.data.domain.Pageable.class
        );
        Query query = method.getAnnotation(Query.class);
        Param normGroupParam = method.getParameters()[0].getAnnotation(Param.class);

        assertThat(query.nativeQuery()).isFalse();
        assertThat(query.value())
                .contains("new com.round13.backend.module.members.potential.BoxerPotentialLeaderboardRow")
                .contains("not exists")
                .contains("newer.measuredAt > bpm.measuredAt")
                .doesNotContain("row_number()")
                .doesNotContain(" as memberId");
        assertThat(normGroupParam.value()).isEqualTo("normGroup");
    }
}
