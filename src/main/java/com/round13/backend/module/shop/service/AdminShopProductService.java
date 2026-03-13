package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopCategoryEntity;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.dto.ShopCatalogItemResponse;
import com.round13.backend.module.shop.dto.UpsertShopProductRequest;
import com.round13.backend.module.shop.mapper.ShopCatalogMapper;
import com.round13.backend.module.shop.mapper.ShopProductMapper;
import com.round13.backend.module.shop.repo.ShopCategoryRepository;
import com.round13.backend.module.shop.repo.ShopProductRepository;
import com.round13.backend.module.shop.util.ShopImageUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Администрирование товаров магазина.
 */
@Service
@RequiredArgsConstructor
public class AdminShopProductService {

    private static final int MAX_IMAGE_BYTES = 1_000_000;

    private final ShopProductRepository productRepository;
    private final ShopCategoryRepository categoryRepository;
    private final ShopCatalogMapper catalogMapper;
    private final ShopProductMapper productMapper;

    @Transactional
    public ShopCatalogItemResponse create(UpsertShopProductRequest request) {
        ShopCategoryEntity category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SHOP_CATEGORY_NOT_FOUND));

        ShopProductEntity entity = productMapper.toEntity(request);
        entity.setCode(UUID.randomUUID().toString());
        entity.setCategory(category);
        applyImage(entity, request.imageDataUrl());

        ShopProductEntity saved = productRepository.save(entity);
        return catalogMapper.toItem(saved);
    }

    private void applyImage(ShopProductEntity entity, String rawImageValue) {
        String value = ShopImageUtils.trimToNull(rawImageValue);
        if (value == null) {
            entity.setImageData(null);
            entity.setImageContentType(null);
            return;
        }

        if (!ShopImageUtils.isDataUrl(value)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        ShopImageUtils.DecodedImage decoded = ShopImageUtils.decodeDataUrlOrNull(value, MAX_IMAGE_BYTES);
        entity.setImageData(decoded.bytes());
        entity.setImageContentType(decoded.contentType());
    }
}
