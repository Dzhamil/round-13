package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopCategoryEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.mapper.ShopCategoryMapper;
import com.round13.backend.module.shop.repo.ShopCategoryRepository;
import com.round13.backend.module.shop.repo.ShopProductRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminShopCategoryServiceTest {

    private final ShopCategoryRepository categoryRepository = mock(ShopCategoryRepository.class);
    private final ShopProductRepository productRepository = mock(ShopProductRepository.class);
    private final ShopCategoryMapper categoryMapper = mock(ShopCategoryMapper.class);
    private final AdminShopCategoryService service = new AdminShopCategoryService(
            categoryRepository,
            productRepository,
            categoryMapper
    );

    @Test
    void deleteSoftDeletesCategoryAndProducts() {
        UUID categoryId = UUID.randomUUID();
        ShopCategoryEntity category = new ShopCategoryEntity();
        category.setId(categoryId);
        category.setActive(true);
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        service.delete(categoryId);

        assertThat(category.isActive()).isFalse();
        verify(productRepository).deactivateByCategoryId(categoryId);
        verify(categoryRepository).save(category);
        verify(categoryRepository, never()).delete(category);
    }

    @Test
    void deleteMissingCategoryFails() {
        UUID categoryId = UUID.randomUUID();
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(categoryId))
                .isInstanceOfSatisfying(BusinessException.class, ex ->
                        assertThat(((BusinessException) ex).getErrorCode())
                                .isEqualTo(ErrorCode.SHOP_CATEGORY_NOT_FOUND));
    }
}
