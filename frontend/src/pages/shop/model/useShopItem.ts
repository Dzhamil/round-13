import { useEffect, useState } from "react";

import type { ShopCatalogItemDto } from "../api/product.api";
import { fetchShopProductByCode } from "../api/product.api";

export function useShopItem(code: string) {
    const [item, setItem] = useState<ShopCatalogItemDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        setItem(null);

        try {
            const data = await fetchShopProductByCode(code);
            setItem(data);
        } catch {
            setError("Не удалось загрузить карточку товара.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    return { item, loading, error, reload: load };
}
