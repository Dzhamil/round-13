// shop/model/shop.contract.ts
/**
 * DTO — что приходит/уходит на backend API.
 * UI НЕ импортирует отсюда типы.
 */

export type ShopProductDto = {
    id: string;
    code: string;
    title: string;
    description?: string;

    // backend может расширяться, поэтому здесь просто string
    category: string;

    // minor units: копейки/центы
    priceAmount: number;
    currency: string;

    imageUrl?: string;

    isActive: boolean;
    sortOrder: number;
};

export type ShopOrderStatusDto = string;

export type CreateShopOrderRequestDto = {
    items: Array<{
        productId: string;
        quantity: number;
    }>;
};

export type ShopOrderItemDto = {
    productId: string;
    title: string;
    quantity: number;
    unitAmount: number;
    lineAmount: number;
    currency: string;
};

export type ShopOrderDto = {
    id: string;
    status: ShopOrderStatusDto;
    totalAmount: number;
    currency: string;
    createdAt: string;
    items: ShopOrderItemDto[];
};
