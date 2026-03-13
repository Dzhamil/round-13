import type { ShopProductDto } from "./shop.contract";
import type { ShopCatalogItemDto, MoneyCurrency, ShopProductCategory } from "./shop.types";

const CATEGORIES: readonly ShopProductCategory[] = ["SUBSCRIPTION", "PERSONAL", "PACKAGE", "MERCH"];
const CURRENCIES: readonly MoneyCurrency[] = ["RUB", "USD", "EUR"];

function isCategory(x: string): x is ShopProductCategory {
    return (CATEGORIES as readonly string[]).indexOf(x) !== -1;
}

function isCurrency(x: string): x is MoneyCurrency {
    return (CURRENCIES as readonly string[]).indexOf(x) !== -1;
}

export function mapShopProductDtoToCatalogItem(dto: ShopProductDto): ShopCatalogItemDto {
    return {
        id: dto.id,
        code: dto.code,
        title: dto.title,
        description: dto.description,
        category: isCategory(dto.category) ? dto.category : "MERCH",
        priceAmount: dto.priceAmount,
        currency: isCurrency(dto.currency) ? dto.currency : "RUB",
        imageDataUrl: dto.imageDataUrl,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
    };
}
