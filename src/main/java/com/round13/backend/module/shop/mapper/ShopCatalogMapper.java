package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.module.shop.dto.ShopCatalogItemResponse;
import com.round13.backend.module.shop.util.ShopImageUtils;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Маппер каталога магазина.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShopCatalogMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryTitle", source = "category.title")
    @Mapping(target = "imageDataUrl", expression = "java(toImageDataUrl(entity))")
    @Mapping(target = "isActive", source = "active")
    ShopCatalogItemResponse toItem(ShopProductEntity entity);

    List<ShopCatalogItemResponse> toItems(List<ShopProductEntity> entities);

    default String toImageDataUrl(ShopProductEntity entity) {
        return ShopImageUtils.toDataUrl(entity.getImageContentType(), entity.getImageData());
    }
}
