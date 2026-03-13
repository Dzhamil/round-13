package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.ShopCategoryEntity;
import com.round13.backend.module.shop.dto.ShopCategoryResponse;
import com.round13.backend.module.shop.dto.UpsertShopCategoryRequest;
import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;

import java.util.Base64;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ShopCategoryMapper {

    @Mapping(target = "previewImageUrl", expression = "java(toDataUrl(entity.getPreviewImageContentType(), entity.getPreviewImage()))")
    ShopCategoryResponse toResponse(ShopCategoryEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "previewImage", ignore = true)
    @Mapping(target = "previewImageContentType", ignore = true)
    @Mapping(target = "active", expression = "java(request.active() == null ? true : request.active())")
    ShopCategoryEntity toEntity(UpsertShopCategoryRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "previewImage", ignore = true)
    @Mapping(target = "previewImageContentType", ignore = true)
    void update(@MappingTarget ShopCategoryEntity entity, UpsertShopCategoryRequest request);

    @AfterMapping
    default void normalize(@MappingTarget ShopCategoryEntity entity) {
        if (entity.getTitle() != null) {
            entity.setTitle(entity.getTitle().trim());
        }
        if (entity.getDescription() != null) {
            entity.setDescription(entity.getDescription().trim());
        }
    }

    default String toDataUrl(String contentType, byte[] bytes) {
        if (bytes == null || bytes.length == 0) return null;
        String ct = (contentType == null || contentType.isBlank()) ? "image/jpeg" : contentType.trim();
        return "data:" + ct + ";base64," + Base64.getEncoder().encodeToString(bytes);
    }
}