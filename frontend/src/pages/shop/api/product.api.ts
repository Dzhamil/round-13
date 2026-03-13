import { http } from "../../../shared/api/http";

export interface ShopCatalogItemDto {
    id: string;
    code: string;
    title: string;
    description?: string;
    categoryId: string;
    categoryTitle: string;
    priceAmount: number;
    currency: string;
    imageDataUrl?: string;
    isActive: boolean;
    sortOrder: number;
}

export interface UpsertShopProductRequest {
    title: string;
    description: string;
    categoryId: string;
    priceAmount: number;
    currency?: string;
    imageDataUrl?: string;
    active?: boolean;
    sortOrder?: number;
}

/** Получить товары определённой категории */
export async function fetchShopProducts(categoryId?: string): Promise<ShopCatalogItemDto[]> {
    if (categoryId) {
        const response = await http.get<ShopCatalogItemDto[]>(`/shop/categories/${encodeURIComponent(categoryId)}/products`);
        return response.data;
    }
    const response = await http.get<ShopCatalogItemDto[]>("/shop/products");
    return response.data;
}

/** Получить товар по коду */
export async function fetchShopProductByCode(code: string): Promise<ShopCatalogItemDto> {
    const safe = code.trim();
    const response = await http.get<ShopCatalogItemDto>(`/shop/products/code/${encodeURIComponent(safe)}`);
    return response.data;
}

export async function createShopProduct(
    data: UpsertShopProductRequest
): Promise<ShopCatalogItemDto> {
    const response = await http.post<ShopCatalogItemDto>("/admin/shop/products", data);
    return response.data;
}
