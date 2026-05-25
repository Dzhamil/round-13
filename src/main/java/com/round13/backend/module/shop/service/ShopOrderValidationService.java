package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.domain.UserEntitlementType;
import com.round13.backend.module.shop.dto.CreateShopOrderRequest;
import com.round13.backend.module.shop.dto.ValidatedOrderData;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.repo.ShopProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Сервис валидации заказа магазина.
 */
@Service
@RequiredArgsConstructor
public class ShopOrderValidationService {

    private static final int MIN_QUANTITY = 1;
    private final ShopProductRepository shopProductRepository;
    private final Clock clock;

    /**
     * Валидирует запрос на создание заказа и подготавливает данные
     * для дальнейшей обработки.
     *
     * @param request запрос на создание заказа
     * @return валидированные данные заказа
     */
    public ValidatedOrderData validate(CreateShopOrderRequest request) {
        CreateShopOrderRequest safeRequest = Optional.ofNullable(request)
                .filter(r -> r.items() != null && !r.items().isEmpty())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REQUEST));

        Map<UUID, Integer> quantities = collectQuantities(safeRequest);
        List<ShopProductEntity> products = loadProducts(quantities);
        Map<UUID, ShopProductEntity> productById = validateProducts(products);
        Map<UUID, ValidatedOrderData.TrainingRequestData> trainingRequests = validateTrainingRequests(
                safeRequest,
                productById
        );

        return new ValidatedOrderData(quantities, productById, trainingRequests);
    }

    private Map<UUID, Integer> collectQuantities(CreateShopOrderRequest request) {
        Map<UUID, Integer> result = new HashMap<>();

        request.items().forEach(item -> {
            UUID productId = Optional.ofNullable(item)
                    .map(CreateShopOrderRequest.Item::productId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REQUEST));

            int quantity = item.quantity();
            if (quantity < MIN_QUANTITY) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }

            result.merge(productId, quantity, Integer::sum);
        });

        return result;
    }

    private List<ShopProductEntity> loadProducts(Map<UUID, Integer> quantities) {
        List<ShopProductEntity> products = shopProductRepository.findAllById(quantities.keySet());
        Optional.of(products)
                .filter(list -> list.size() == quantities.size())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REQUEST));
        return products;
    }

    private Map<UUID, ShopProductEntity> validateProducts(List<ShopProductEntity> products) {
        Map<UUID, ShopProductEntity> result = new HashMap<>();
        String currency = null;
        for (ShopProductEntity product : products) {
            ShopProductEntity safeProduct = Optional.ofNullable(product)
                    .filter(ShopProductEntity::isActive)
                    .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REQUEST));
            if (currency == null) {
                currency = safeProduct.getCurrency();
            } else if (!currency.equals(safeProduct.getCurrency())) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }
            result.put(safeProduct.getId(), safeProduct);
        }
        return result;
    }

    private Map<UUID, ValidatedOrderData.TrainingRequestData> validateTrainingRequests(
            CreateShopOrderRequest request,
            Map<UUID, ShopProductEntity> products
    ) {
        Map<UUID, ValidatedOrderData.TrainingRequestData> result = new HashMap<>();
        int personalTrainingItems = 0;

        for (CreateShopOrderRequest.Item item : request.items()) {
            UUID productId = item.productId();
            ShopProductEntity product = products.get(productId);
            boolean personalTraining = isPersonalTrainingProduct(product);
            CreateShopOrderRequest.TrainingRequest trainingRequest = item.trainingRequest();

            if (!personalTraining) {
                if (trainingRequest != null) {
                    throw new BusinessException(ErrorCode.INVALID_REQUEST);
                }
                continue;
            }

            personalTrainingItems++;
            if (personalTrainingItems > 1 || item.quantity() > MIN_QUANTITY) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }

            OffsetDateTime requestedStartTime = Optional.ofNullable(trainingRequest)
                    .map(CreateShopOrderRequest.TrainingRequest::requestedStartTime)
                    .filter(this::isFuture)
                    .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REQUEST));

            result.put(productId, new ValidatedOrderData.TrainingRequestData(
                    productId,
                    product.getTrainerId(),
                    requestedStartTime
            ));
        }

        return result;
    }

    private boolean isPersonalTrainingProduct(ShopProductEntity product) {
        return Optional.ofNullable(product)
                .map(ShopProductEntity::getEntitlementType)
                .filter(UserEntitlementType::isPersonalTrainings)
                .isPresent();
    }

    private boolean isFuture(OffsetDateTime value) {
        return value.isAfter(OffsetDateTime.now(clock));
    }
}
