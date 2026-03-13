import { http } from "../../../shared/api/http";

import type { ShopProductDto } from "../model/shop.contract";
import type { ShopCatalogItemDto, ShopProductCategory } from "../model/shop.types";
import { mapShopProductDtoToCatalogItem } from "../model/shop.mappers";

/**
 * Получить каталог магазина (активные товары).
 *
 * GET /api/shop/catalog?category=...
 */
export async function fetchShopCatalog(params?: {
    category?: ShopProductCategory;
}): Promise<ShopCatalogItemDto[]> {

    const response = await http.get<ShopProductDto[]>("/shop/catalog", {
        params: params?.category ? { category: params.category } : undefined,
    });

    return response.data.map(mapShopProductDtoToCatalogItem);
}

/**
 * Получить карточку активного товара по стабильному коду.
 *
 * GET /api/shop/catalog/{code}
 */
export async function fetchShopCatalogItemByCode(code: string): Promise<ShopCatalogItemDto> {
    const safeCode = code?.trim();
    if (!safeCode) {
        throw new Error("code is required");
    }

    const response = await http.get<ShopProductDto>(
        `/shop/catalog/${encodeURIComponent(safeCode)}`
    );

    return mapShopProductDtoToCatalogItem(response.data);
}
