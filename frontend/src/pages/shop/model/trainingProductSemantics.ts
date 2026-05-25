import type { ShopEntitlementType } from "../api/product.api";

type TrainingProductFields = {
    categoryTitle?: string | null;
    entitlementType?: ShopEntitlementType | null;
    entitlementQuantity?: number | null;
};

const ENTITLEMENT_LABELS: Record<ShopEntitlementType, string> = {
    GROUP_TRAININGS: "Групповые тренировки",
    PERSONAL_TRAININGS: "Персональные тренировки",
};

function formatTrainingCount(quantity?: number | null): string | null {
    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0) {
        return null;
    }

    const normalized = Math.trunc(quantity);
    const mod100 = Math.abs(normalized) % 100;
    const mod10 = Math.abs(normalized) % 10;
    const noun = mod100 >= 11 && mod100 <= 14
        ? "тренировок"
        : mod10 === 1
            ? "тренировка"
            : mod10 >= 2 && mod10 <= 4
                ? "тренировки"
                : "тренировок";

    return `${normalized} ${noun}`;
}

export function getTrainingProductSummary(product: TrainingProductFields): string | null {
    if (!product.entitlementType) {
        return null;
    }

    const label = ENTITLEMENT_LABELS[product.entitlementType];
    const quantity = formatTrainingCount(product.entitlementQuantity);

    return quantity ? `${label} · ${quantity}` : label;
}

export function getProductCategoryContext(product: TrainingProductFields): string | null {
    const categoryTitle = product.categoryTitle?.trim();
    const summary = getTrainingProductSummary(product);
    const parts = [
        categoryTitle ? `Категория: ${categoryTitle}` : null,
        summary,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" · ") : null;
}
