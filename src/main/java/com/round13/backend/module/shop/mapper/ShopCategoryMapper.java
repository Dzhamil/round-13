package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.ShopCategoryEntity;
import com.round13.backend.domain.ShopCategoryType;
import com.round13.backend.module.shop.dto.ShopCategoryResponse;
import com.round13.backend.module.shop.dto.UpsertShopCategoryRequest;
import com.round13.backend.module.shop.util.ShopImageUtils;
import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ShopCategoryMapper {

    @Mapping(target = "previewImageUrl", expression = "java(toPreviewImageUrl(entity))")
    ShopCategoryResponse toResponse(ShopCategoryEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "previewImage", ignore = true)
    @Mapping(target = "previewImageContentType", ignore = true)
    @Mapping(target = "type", expression = "java(request.type() == null ? ShopCategoryType.MERCH : request.type())")
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
        entity.setTitle(ShopImageUtils.trimToNull(entity.getTitle()));
        entity.setDescription(ShopImageUtils.trimToNull(entity.getDescription()));
        if (entity.getType() == null) {
            entity.setType(ShopCategoryType.MERCH);
        }
    }

    default String toPreviewImageUrl(ShopCategoryEntity entity) {
        return ShopImageUtils.toDataUrl(entity.getPreviewImageContentType(), entity.getPreviewImage());
    }
}
