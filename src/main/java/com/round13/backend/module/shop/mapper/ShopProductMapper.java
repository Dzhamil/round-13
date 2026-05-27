package com.round13.backend.module.shop.mapper;

import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.module.shop.dto.UpsertShopProductRequest;
import com.round13.backend.module.shop.util.ShopImageUtils;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import java.util.Locale;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ShopProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "imageData", ignore = true)
    @Mapping(target = "imageContentType", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active", expression = "java(request.active() == null ? true : request.active())")
    @Mapping(target = "sortOrder", expression = "java(request.sortOrder() == null ? 0 : request.sortOrder())")
    @Mapping(target = "currency", source = "currency", qualifiedByName = "normalizeCurrency")
    ShopProductEntity toEntity(UpsertShopProductRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "imageData", ignore = true)
    @Mapping(target = "imageContentType", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "currency", source = "currency", qualifiedByName = "normalizeCurrency")
    void update(@MappingTarget ShopProductEntity entity, UpsertShopProductRequest request);

    @AfterMapping
    default void normalize(@MappingTarget ShopProductEntity entity) {
        entity.setTitle(ShopImageUtils.trimToNull(entity.getTitle()));
        entity.setDescription(ShopImageUtils.trimToNull(entity.getDescription()));
    }

    @Named("normalizeCurrency")
    default String normalizeCurrency(String currency) {
        String normalized = ShopImageUtils.trimToNull(currency);
        return normalized == null ? ShopProductEntity.DEFAULT_CURRENCY : normalized.toUpperCase(Locale.ROOT);
    }
}
