import type { ShopEntitlementType } from "../../../api/product.api";

export const DEFAULT_PRODUCT_CURRENCY = "RUB";
export const DEFAULT_TRAINING_ENTITLEMENT_TYPE: ShopEntitlementType = "GROUP_TRAININGS";

export const PRODUCT_EDIT_TEXT = {
    createTitle: "Добавить товар",
    editTitle: "Редактировать товар",
    productTitleRequired: "Укажите название товара.",
    productDescriptionRequired: "Добавьте описание товара.",
    productPriceInvalid: "Укажите корректную цену.",
    trainingQuantityInvalid: "Укажите количество тренировок в пакете.",
    personalTrainerRequired: "Для персонального пакета выберите тренера.",
    pricePlaceholder: "Например, 1500",
    quantityPlaceholder: "Например, 8",
    trainerPlaceholder: "Выберите тренера",
} as const;

export const ENTITLEMENT_TYPE_OPTIONS: ReadonlyArray<{
    value: ShopEntitlementType;
    label: string;
}> = [
    { value: "GROUP_TRAININGS", label: "Групповые тренировки" },
    { value: "PERSONAL_TRAININGS", label: "Персональные тренировки" },
];
