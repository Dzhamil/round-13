package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopCategoryEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.dto.ShopCategoryResponse;
import com.round13.backend.module.shop.dto.UpsertShopCategoryRequest;
import com.round13.backend.module.shop.mapper.ShopCategoryMapper;
import com.round13.backend.module.shop.repo.ShopCategoryRepository;
import com.round13.backend.module.shop.repo.ShopProductRepository;
import com.round13.backend.module.shop.util.ShopImageUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminShopCategoryService {

    // 1MB лимит на превью после декода (под 512px хватит)
    private static final int MAX_PREVIEW_BYTES = 1_000_000;

    private final ShopCategoryRepository categoryRepository;
    private final ShopProductRepository productRepository;
    private final ShopCategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<ShopCategoryResponse> getAll() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional
    public ShopCategoryResponse create(UpsertShopCategoryRequest request) {
        String title = request.title() == null ? null : request.title().trim();
        if (title == null || title.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        if (categoryRepository.existsByTitle(title)) {
            throw new BusinessException(ErrorCode.SHOP_CATEGORY_EXISTS);
        }

        ShopCategoryEntity entity = categoryMapper.toEntity(request);
        applyPreviewIfPresent(entity, request.previewImageUrl()); // <-- важно

        ShopCategoryEntity saved = categoryRepository.save(entity);
        return categoryMapper.toResponse(saved);
    }

    @Transactional
    public ShopCategoryResponse update(UUID id, UpsertShopCategoryRequest request) {
        ShopCategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHOP_CATEGORY_NOT_FOUND));

        String newTitle = request.title() == null ? null : request.title().trim();
        if (newTitle != null && !newTitle.equalsIgnoreCase(entity.getTitle()) && categoryRepository.existsByTitle(newTitle)) {
            throw new BusinessException(ErrorCode.SHOP_CATEGORY_EXISTS);
        }

        categoryMapper.update(entity, request);
        applyPreviewIfPresent(entity, request.previewImageUrl()); // <-- важно

        ShopCategoryEntity updated = categoryRepository.save(entity);
        return categoryMapper.toResponse(updated);
    }

    @Transactional
    public void delete(UUID id) {
        ShopCategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHOP_CATEGORY_NOT_FOUND));
        productRepository.deactivateByCategoryId(id);
        entity.setActive(false);
        categoryRepository.delete(entity);
    }

    private void applyPreviewIfPresent(ShopCategoryEntity entity, String previewImageUrl) {
        ShopImageUtils.DecodedImage decoded = ShopImageUtils.decodeDataUrlOrNull(previewImageUrl, MAX_PREVIEW_BYTES);
        if (decoded == null) return;
        entity.setPreviewImage(decoded.bytes());
        entity.setPreviewImageContentType(decoded.contentType());
    }
}
