import type { MemberListItem } from "../../../../members/model/members.types";
import type { ShopEntitlementType, UpsertShopProductRequest } from "../../../api/product.api";
import {
    DEFAULT_PRODUCT_CURRENCY,
    DEFAULT_TRAINING_ENTITLEMENT_TYPE,
    PRODUCT_EDIT_TEXT,
} from "./productEditModal.constants";

type ProductCategoryType = "MERCH" | "TRAININGS";

export type ProductEditFormState = {
    title: string;
    description: string;
    priceRubles: string;
    entitlementType: ShopEntitlementType;
    entitlementQuantity: string;
    trainerId: string;
    croppedImageUrl: string;
};

export function buildProductEditFormState(
    product?: (UpsertShopProductRequest & { id?: string }) | null
): ProductEditFormState {
    return {
        title: product?.title ?? "",
        description: product?.description ?? "",
        priceRubles: product ? String(product.priceAmount / 100) : "",
        entitlementType: product?.entitlementType ?? DEFAULT_TRAINING_ENTITLEMENT_TYPE,
        entitlementQuantity: product?.entitlementQuantity ? String(product.entitlementQuantity) : "",
        trainerId: product?.trainerId ?? "",
        croppedImageUrl: product?.imageDataUrl ?? "",
    };
}

export function validateProductEditForm(
    state: ProductEditFormState,
    categoryType: ProductCategoryType
): string | null {
    const normalizedTitle = state.title.trim();
    const normalizedDescription = state.description.trim();
    const parsedPrice = Number(state.priceRubles.replace(",", "."));
    const parsedEntitlementQuantity = Number(state.entitlementQuantity);

    if (!normalizedTitle) {
        return PRODUCT_EDIT_TEXT.productTitleRequired;
    }

    if (!normalizedDescription) {
        return PRODUCT_EDIT_TEXT.productDescriptionRequired;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return PRODUCT_EDIT_TEXT.productPriceInvalid;
    }

    if (categoryType !== "TRAININGS") {
        return null;
    }

    if (!Number.isFinite(parsedEntitlementQuantity) || parsedEntitlementQuantity <= 0) {
        return PRODUCT_EDIT_TEXT.trainingQuantityInvalid;
    }

    if (state.entitlementType === "PERSONAL_TRAININGS" && !state.trainerId) {
        return PRODUCT_EDIT_TEXT.personalTrainerRequired;
    }

    return null;
}

export function getTrainingProductAdminHint(
    state: Pick<ProductEditFormState, "entitlementType" | "entitlementQuantity">,
    categoryType: ProductCategoryType
): string | null {
    if (categoryType !== "TRAININGS") {
        return null;
    }

    if (state.entitlementType === "PERSONAL_TRAININGS") {
        return PRODUCT_EDIT_TEXT.personalTrainingPlacementHint;
    }

    const parsedEntitlementQuantity = Number(state.entitlementQuantity);
    if (state.entitlementType === "GROUP_TRAININGS" && parsedEntitlementQuantity === 1) {
        return PRODUCT_EDIT_TEXT.oneTimeGroupTrainingHint;
    }

    return null;
}

export function buildUpsertShopProductPayload(
    state: ProductEditFormState,
    categoryId: string,
    categoryType: ProductCategoryType
): UpsertShopProductRequest {
    const normalizedPrice = Number(state.priceRubles.replace(",", "."));
    const entitlementQuantity = Number(state.entitlementQuantity);
    const isTrainingCategory = categoryType === "TRAININGS";

    return {
        title: state.title.trim(),
        description: state.description.trim(),
        categoryId,
        priceAmount: Math.round(normalizedPrice * 100),
        currency: DEFAULT_PRODUCT_CURRENCY,
        imageDataUrl: state.croppedImageUrl || undefined,
        active: true,
        sortOrder: 0,
        entitlementType: isTrainingCategory ? state.entitlementType : undefined,
        entitlementQuantity: isTrainingCategory ? entitlementQuantity : undefined,
        trainerId:
            isTrainingCategory && state.entitlementType === "PERSONAL_TRAININGS" && state.trainerId
                ? state.trainerId
                : undefined,
    };
}

export function formatCoachOptionLabel(coach: MemberListItem): string {
    return coach.nickname || coach.phone || coach.id;
}
