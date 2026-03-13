package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.dto.ShopCategoryResponse;
import com.round13.backend.module.shop.dto.ShopCatalogItemResponse;
import com.round13.backend.module.shop.mapper.ShopCategoryMapper;
import com.round13.backend.module.shop.mapper.ShopCatalogMapper;
import com.round13.backend.module.shop.repo.ShopCategoryRepository;
import com.round13.backend.module.shop.repo.ShopProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Сервис каталога магазина.
 */
@Service
@RequiredArgsConstructor
public class ShopCatalogService {

    private final ShopCategoryRepository categoryRepository;
    private final ShopProductRepository productRepository;
    private final ShopCategoryMapper categoryMapper;
    private final ShopCatalogMapper catalogMapper;

    /**
     * Список активных категорий.
     */
    public List<ShopCategoryResponse> getCategories() {
        return categoryRepository.findByActiveTrueOrderByTitleAsc()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    /**
     * Список активных товаров с фильтром по категории.
     *
     * @param categoryId идентификатор категории (null для всех)
     */
    public List<ShopCatalogItemResponse> getProducts(UUID categoryId) {
        return catalogMapper.toItems(
                productRepository.findActiveCatalog(categoryId)
        );
    }

    /**
     * Получить карточку активного товара по стабильному коду.
     */
    public ShopCatalogItemResponse getProductByCode(String code) {
        if (code == null || code.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        ShopProductEntity product = productRepository.findByCodeAndActiveTrue(code.trim())
                .orElseThrow(() -> new BusinessException(ErrorCode.SHOP_PRODUCT_NOT_FOUND));
        return catalogMapper.toItem(product);
    }
}
