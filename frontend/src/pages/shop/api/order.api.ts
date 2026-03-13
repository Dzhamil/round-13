import { http } from "../../../shared/api/http";

type CreateShopOrderRequest = {
    items: Array<{
        productId: string;
        quantity: number;
    }>;
};

export async function createShopOrder(data: CreateShopOrderRequest): Promise<string> {
    const response = await http.post<string>("/shop/orders", data);
    return response.data;
}
