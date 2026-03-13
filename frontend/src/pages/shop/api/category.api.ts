import { http } from "../../../shared/api/http";

export type ShopCategoryResponse = {
    id: string;
    title: string;
    description: string;
    previewImageUrl?: string | null;
    active: boolean;
};

export type UpsertShopCategoryRequest = {
    title: string;
    description: string;
    previewImageUrl?: string;
    active?: boolean;
};

export async function fetchShopCategories(): Promise<ShopCategoryResponse[]> {
    const res = await http.get<ShopCategoryResponse[]>("/shop/categories");
    return res.data;
}

export async function createShopCategory(
    data: UpsertShopCategoryRequest
): Promise<ShopCategoryResponse> {
    const res = await http.post<ShopCategoryResponse>("/admin/shop/categories", data);
    return res.data;
}

export async function updateShopCategory(
    id: string,
    data: UpsertShopCategoryRequest
): Promise<ShopCategoryResponse> {
    const res = await http.put<ShopCategoryResponse>(`/admin/shop/categories/${encodeURIComponent(id)}`, data);
    return res.data;
}

export async function deleteShopCategory(id: string): Promise<void> {
    await http.delete(`/admin/shop/categories/${encodeURIComponent(id)}`);
}
