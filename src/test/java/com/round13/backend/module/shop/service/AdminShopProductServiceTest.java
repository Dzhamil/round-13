package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopCategoryEntity;
import com.round13.backend.domain.ShopCategoryType;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.domain.UserEntitlementType;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.dto.UpsertShopProductRequest;
import com.round13.backend.module.shop.mapper.ShopCatalogMapper;
import com.round13.backend.module.shop.mapper.ShopProductMapper;
import com.round13.backend.module.shop.repo.ShopCategoryRepository;
import com.round13.backend.module.shop.repo.ShopProductRepository;
import com.round13.backend.module.user.UserRoleCodes;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminShopProductServiceTest {

    private final ShopProductRepository productRepository = mock(ShopProductRepository.class);
    private final ShopCategoryRepository categoryRepository = mock(ShopCategoryRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final ShopCatalogMapper catalogMapper = Mappers.getMapper(ShopCatalogMapper.class);
    private final ShopProductMapper productMapper = Mappers.getMapper(ShopProductMapper.class);
    private final AdminShopProductService service = new AdminShopProductService(
            productRepository,
            categoryRepository,
            catalogMapper,
            productMapper,
            new ShopProductConfigurationService(userRepository)
    );

    @Test
    void deleteActiveProductSoftDeletesRow() {
        UUID productId = UUID.randomUUID();
        ShopProductEntity product = product(productId, trainingCategory(UUID.randomUUID()));
        product.setActive(true);
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        service.delete(productId);

        assertThat(product.isActive()).isFalse();
        verify(productRepository).save(product);
    }

    @Test
    void deleteInactiveProductIsIdempotent() {
        UUID productId = UUID.randomUUID();
        ShopProductEntity product = product(productId, trainingCategory(UUID.randomUUID()));
        product.setActive(false);
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        service.delete(productId);

        verify(productRepository, never()).save(any());
    }

    @Test
    void updateTrainingProductAppliesTrainingFields() {
        UUID categoryId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        UUID trainerId = UUID.randomUUID();
        ShopCategoryEntity category = trainingCategory(categoryId);
        ShopProductEntity product = product(productId, category);
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(userRepository.findRoleCode(trainerId)).thenReturn(Optional.of(UserRoleCodes.COACH));
        when(productRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.update(productId, request(
                categoryId,
                "Personal pack",
                "Updated training package",
                550000,
                UserEntitlementType.PERSONAL_TRAININGS,
                4,
                trainerId
        ));

        assertThat(product.getTitle()).isEqualTo("Personal pack");
        assertThat(product.getDescription()).isEqualTo("Updated training package");
        assertThat(product.getPriceAmount()).isEqualTo(550000);
        assertThat(product.getEntitlementType()).isEqualTo(UserEntitlementType.PERSONAL_TRAININGS);
        assertThat(product.getEntitlementQuantity()).isEqualTo(4);
        assertThat(product.getTrainerId()).isEqualTo(trainerId);
        verify(productRepository).save(product);
    }

    @Test
    void updateTrainingProductRejectsMissingTrainingMetadata() {
        UUID categoryId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        ShopCategoryEntity category = trainingCategory(categoryId);
        ShopProductEntity product = product(productId, category);
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        assertThatThrownBy(() -> service.update(productId, request(
                categoryId,
                "Legacy pack",
                "Needs recovery",
                100000,
                null,
                null,
                null
        )))
                .isInstanceOfSatisfying(BusinessException.class, ex ->
                        assertThat(((BusinessException) ex).getErrorCode())
                                .isEqualTo(ErrorCode.INVALID_REQUEST));
        verify(productRepository, never()).save(any());
    }

    private UpsertShopProductRequest request(
            UUID categoryId,
            String title,
            String description,
            int priceAmount,
            UserEntitlementType entitlementType,
            Integer entitlementQuantity,
            UUID trainerId
    ) {
        return new UpsertShopProductRequest(
                title,
                description,
                categoryId,
                priceAmount,
                ShopProductEntity.DEFAULT_CURRENCY,
                null,
                true,
                0,
                entitlementType,
                entitlementQuantity,
                trainerId
        );
    }

    private ShopProductEntity product(UUID id, ShopCategoryEntity category) {
        ShopProductEntity product = new ShopProductEntity();
        product.setId(id);
        product.setCode("product-" + id);
        product.setTitle("Old title");
        product.setDescription("Old description");
        product.setCategory(category);
        product.setCurrency(ShopProductEntity.DEFAULT_CURRENCY);
        product.setPriceAmount(100000);
        product.setActive(true);
        product.setSortOrder(0);
        product.setEntitlementType(UserEntitlementType.GROUP_TRAININGS);
        product.setEntitlementQuantity(1);
        return product;
    }

    private ShopCategoryEntity trainingCategory(UUID id) {
        ShopCategoryEntity category = new ShopCategoryEntity();
        category.setId(id);
        category.setTitle("Training");
        category.setDescription("Training category");
        category.setType(ShopCategoryType.TRAININGS);
        category.setActive(true);
        return category;
    }
}
