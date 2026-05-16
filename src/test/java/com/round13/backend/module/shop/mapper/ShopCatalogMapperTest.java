package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.ShopCategoryEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.module.shop.dto.ShopCatalogItemResponse;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ShopCatalogMapperTest {

    private final ShopCatalogMapper mapper = Mappers.getMapper(ShopCatalogMapper.class);

    @Test
    void toItemMapsActiveProductToIsActive() {
        ShopCatalogItemResponse response = mapper.toItem(product(true));

        assertThat(response.isActive()).isTrue();
    }

    @Test
    void toItemMapsInactiveProductToIsActiveFalse() {
        ShopCatalogItemResponse response = mapper.toItem(product(false));

        assertThat(response.isActive()).isFalse();
    }

    @Test
    void toItemsKeepsActiveStateForEachProduct() {
        List<ShopCatalogItemResponse> responses = mapper.toItems(List.of(product(true), product(false)));

        assertThat(responses)
                .extracting(ShopCatalogItemResponse::isActive)
                .containsExactly(true, false);
    }

    private ShopProductEntity product(boolean active) {
        ShopCategoryEntity category = new ShopCategoryEntity();
        category.setId(UUID.randomUUID());
        category.setTitle("Merch");

        ShopProductEntity product = new ShopProductEntity();
        product.setId(UUID.randomUUID());
        product.setCode(active ? "active-product" : "inactive-product");
        product.setTitle(active ? "Active product" : "Inactive product");
        product.setCategory(category);
        product.setPriceAmount(1000);
        product.setCurrency(ShopProductEntity.DEFAULT_CURRENCY);
        product.setActive(active);

        return product;
    }
}
