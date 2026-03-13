import { http } from "../../../shared/api/http";
import type {
    MoneyCurrency,
    PendingPurchaseRequest,
    ShopOrderHistoryItem,
    ShopOrderStatus,
} from "../model/shop.types";

type CreateShopOrderRequest = {
    items: Array<{
        productId: string;
        quantity: number;
    }>;
};

type ShopOrderHistoryItemDto = {
    id: string;
    title: string;
    itemCount: number;
    status: ShopOrderStatus;
    totalAmount: number;
    currency: string;
    createdAt: string;
};

type PendingPurchaseRequestDto = {
    id: string;
    buyerName: string;
    avatarUrl?: string | null;
    category: string;
    productTitle: string;
    totalAmount: number;
    currency: string;
    createdAt: string;
    itemCount: number;
};

export async function createShopOrder(data: CreateShopOrderRequest): Promise<string> {
    const response = await http.post<string>("/shop/orders", data);
    return response.data;
}

export async function fetchMyShopOrders(): Promise<ShopOrderHistoryItem[]> {
    const response = await http.get<ShopOrderHistoryItemDto[]>("/shop/orders");
    return response.data.map((item) => ({
        ...item,
        currency: normalizeCurrency(item.currency),
    }));
}

export async function fetchPendingShopOrders(): Promise<PendingPurchaseRequest[]> {
    const response = await http.get<PendingPurchaseRequestDto[]>("/admin/shop/orders/pending");
    return response.data.map((item) => ({
        ...item,
        currency: normalizeCurrency(item.currency),
    }));
}

export async function updateShopOrderStatus(
    orderId: string,
    status: Extract<ShopOrderStatus, "PAID" | "CANCELED">
): Promise<void> {
    await http.patch(`/admin/shop/orders/${encodeURIComponent(orderId)}/status`, { status });
}

function normalizeCurrency(currency: string): MoneyCurrency {
    if (currency === "USD" || currency === "EUR") return currency;
    return "RUB";
}
