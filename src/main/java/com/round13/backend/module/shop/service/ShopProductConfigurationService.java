package com.round13.backend.module.shop.service;

import com.round13.backend.domain.ShopCategoryEntity;
import com.round13.backend.domain.ShopCategoryType;
import com.round13.backend.domain.ShopProductEntity;
import com.round13.backend.domain.UserEntitlementType;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.shop.dto.UpsertShopProductRequest;
import com.round13.backend.module.shop.util.ShopImageUtils;
import com.round13.backend.module.user.UserRoleCodes;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ShopProductConfigurationService {

    private static final int MAX_IMAGE_BYTES = 1_000_000;
    private static final int MIN_TRAINING_ENTITLEMENT_QUANTITY = 1;

    private final UserRepository userRepository;

    public void applyConfiguration(
            ShopProductEntity entity,
            UpsertShopProductRequest request,
            ShopCategoryEntity category
    ) {
        applyTrainingSettings(entity, request, category);
        applyImage(entity, request.imageDataUrl());
    }

    private void applyTrainingSettings(
            ShopProductEntity entity,
            UpsertShopProductRequest request,
            ShopCategoryEntity category
    ) {
        if (category.getType() != ShopCategoryType.TRAININGS) {
            resetTrainingSettings(entity);
            return;
        }

        UserEntitlementType entitlementType = request.entitlementType();
        Integer entitlementQuantity = request.entitlementQuantity();
        if (entitlementType == null
                || entitlementQuantity == null
                || entitlementQuantity < MIN_TRAINING_ENTITLEMENT_QUANTITY) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        entity.setEntitlementType(entitlementType);
        entity.setEntitlementQuantity(entitlementQuantity);

        if (entitlementType.isPersonalTrainings()) {
            entity.setTrainerId(resolveEligibleTrainerId(request.trainerId()));
            return;
        }

        entity.setTrainerId(resolveOptionalTrainerId(request.trainerId()));
    }

    private void resetTrainingSettings(ShopProductEntity entity) {
        entity.setEntitlementType(null);
        entity.setEntitlementQuantity(null);
        entity.setTrainerId(null);
    }

    private java.util.UUID resolveEligibleTrainerId(java.util.UUID trainerId) {
        if (trainerId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        return resolveOptionalTrainerId(trainerId);
    }

    private java.util.UUID resolveOptionalTrainerId(java.util.UUID trainerId) {
        if (trainerId == null) {
            return null;
        }

        String roleCode = userRepository.findRoleCode(trainerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (!UserRoleCodes.COACH.equals(roleCode) && !UserRoleCodes.ADMIN.equals(roleCode)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        return trainerId;
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
