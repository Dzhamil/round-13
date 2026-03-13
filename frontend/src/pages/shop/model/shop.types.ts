// shop/model/shop.types.ts

/**
 * Внутренние типы фронта для Shop.
 * UI должен импортировать типы отсюда, а не из contract.
 */

/** Категории товаров магазина */
export type ShopProductCategory =
    | "SUBSCRIPTION"
    | "PERSONAL"
    | "PACKAGE"
    | "MERCH";

/** Валюта */
export type MoneyCurrency = "RUB" | "USD" | "EUR";

/** Элемент каталога */
export type ShopCatalogItemDto = {
    id: string;
    code: string;
    title: string;
    description?: string;
    category: ShopProductCategory;

    /** minor units (копейки/центы) */
    priceAmount: number;
    currency: MoneyCurrency;

    imageDataUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
};

/** Статусы заказа */
export type ShopOrderStatus =
    | "PENDING"
    | "PAID"
    | "CANCELED"
    | "FAILED";

/** Запрос на создание заказа */
export type CreateShopOrderItem = {
    productId: string;
    quantity: number;
};
