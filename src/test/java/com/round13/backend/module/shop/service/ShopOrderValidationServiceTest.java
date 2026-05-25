package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.domain.UserEntitlementType;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.dto.CreateShopOrderRequest;
import com.round13.backend.module.shop.dto.ValidatedOrderData;
import com.round13.backend.module.shop.repo.ShopProductRepository;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ShopOrderValidationServiceTest {

    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-05-24T12:00:00Z");

    private final ShopProductRepository productRepository = mock(ShopProductRepository.class);
    private final ShopOrderValidationService service = new ShopOrderValidationService(
            productRepository,
            Clock.fixed(Instant.parse("2026-05-24T12:00:00Z"), ZoneOffset.UTC)
    );

    @Test
    void personalTrainingRequiresRequestedStartTime() {
        ShopProductEntity product = personalProduct(UUID.randomUUID());
        when(productRepository.findAllById(any())).thenReturn(List.of(product));

        assertInvalid(() -> service.validate(request(item(product.getId(), null))));
    }

    @Test
    void personalTrainingRejectsPastRequestedStartTime() {
        ShopProductEntity product = personalProduct(UUID.randomUUID());
        when(productRepository.findAllById(any())).thenReturn(List.of(product));

        assertInvalid(() -> service.validate(request(item(product.getId(), NOW.minusMinutes(1)))));
    }

    @Test
    void personalTrainingAcceptsFutureRequestedStartTime() {
        ShopProductEntity product = personalProduct(UUID.randomUUID());
        OffsetDateTime requestedStartTime = NOW.plusDays(1);
        when(productRepository.findAllById(any())).thenReturn(List.of(product));

        ValidatedOrderData result = service.validate(request(item(product.getId(), requestedStartTime)));

        assertThat(result.trainingRequests()).containsOnlyKeys(product.getId());
        ValidatedOrderData.TrainingRequestData trainingRequest = result.trainingRequests().get(product.getId());
        assertThat(trainingRequest.requestedStartTime()).isEqualTo(requestedStartTime);
        assertThat(trainingRequest.trainerId()).isEqualTo(product.getTrainerId());
    }

    @Test
    void merchDoesNotRequireTrainingRequest() {
        ShopProductEntity product = merchProduct(UUID.randomUUID());
        when(productRepository.findAllById(any())).thenReturn(List.of(product));

        ValidatedOrderData result = service.validate(request(item(product.getId(), null)));

        assertThat(result.trainingRequests()).isEmpty();
    }

    @Test
    void groupTrainingDoesNotRequireTrainingRequest() {
        ShopProductEntity product = trainingProduct(UUID.randomUUID(), UserEntitlementType.GROUP_TRAININGS);
        when(productRepository.findAllById(any())).thenReturn(List.of(product));

        ValidatedOrderData result = service.validate(request(item(product.getId(), null)));

        assertThat(result.trainingRequests()).isEmpty();
    }

    @Test
    void multiplePersonalTrainingItemsAreRejected() {
        ShopProductEntity first = personalProduct(UUID.randomUUID());
        ShopProductEntity second = personalProduct(UUID.randomUUID());
        when(productRepository.findAllById(any())).thenReturn(List.of(first, second));

        assertInvalid(() -> service.validate(request(
                item(first.getId(), NOW.plusDays(1)),
                item(second.getId(), NOW.plusDays(2))
        )));
    }

    private CreateShopOrderRequest request(CreateShopOrderRequest.Item... items) {
        return new CreateShopOrderRequest(List.of(items));
    }

    private CreateShopOrderRequest.Item item(UUID productId, OffsetDateTime requestedStartTime) {
        return new CreateShopOrderRequest.Item(
                productId,
                1,
                Optional.ofNullable(requestedStartTime)
                        .map(CreateShopOrderRequest.TrainingRequest::new)
                        .orElse(null)
        );
    }

    private ShopProductEntity personalProduct(UUID id) {
        ShopProductEntity product = trainingProduct(id, UserEntitlementType.PERSONAL_TRAININGS);
        product.setTrainerId(UUID.randomUUID());
        return product;
    }

    private ShopProductEntity trainingProduct(UUID id, UserEntitlementType entitlementType) {
        ShopProductEntity product = merchProduct(id);
        product.setEntitlementType(entitlementType);
        product.setEntitlementQuantity(1);
        return product;
    }

    private ShopProductEntity merchProduct(UUID id) {
        ShopProductEntity product = new ShopProductEntity();
        product.setId(id);
        product.setActive(true);
        product.setCurrency(ShopProductEntity.DEFAULT_CURRENCY);
        product.setPriceAmount(1000);
        return product;
    }

    private void assertInvalid(Runnable action) {
        assertThatThrownBy(action::run)
                .isInstanceOfSatisfying(BusinessException.class, ex ->
                        assertThat(((BusinessException) ex).getErrorCode()).isEqualTo(ErrorCode.INVALID_REQUEST));
    }
}
