package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.OrderStatus;
import com.round13.backend.domain.ShopOrderEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.module.shop.dto.PurchaseRequestDto;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class AdminShopOrderMapperTest {

    private final AdminShopOrderMapper mapper = Mappers.getMapper(AdminShopOrderMapper.class);

    @Test
    void toPurchaseRequestMapsRequestedSlotFields() {
        OffsetDateTime requestedStartTime = OffsetDateTime.parse("2026-05-25T12:00:00Z");
        UUID trainerId = UUID.randomUUID();
        ShopOrderEntity order = new ShopOrderEntity();
        order.setId(UUID.randomUUID());
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(5000);
        order.setCurrency(ShopProductEntity.DEFAULT_CURRENCY);

        PurchaseRequestDto result = mapper.toPurchaseRequest(
                order,
                "buyer",
                null,
                "Тренировки",
                "Персональная тренировка",
                1,
                requestedStartTime,
                trainerId
        );

        assertThat(result.requestedStartTime()).isEqualTo(requestedStartTime);
        assertThat(result.requestedTrainerId()).isEqualTo(trainerId);
    }
}
