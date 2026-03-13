import { useCallback, useEffect, useRef, useState } from "react";
import type { ShopCatalogItemDto } from "../api/product.api";
import { fetchShopProducts } from "../api/product.api";

export function useShopProducts(categoryId?: string) {
    const [items, setItems] = useState<ShopCatalogItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const requestSeq = useRef(0);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const load = useCallback(async () => {
        const seq = ++requestSeq.current;

        setLoading(true);
        setError(null);

        try {
            const data = await fetchShopProducts(categoryId);
            if (!mounted.current || seq !== requestSeq.current) return;
            setItems(data);
        } catch {
            if (!mounted.current || seq !== requestSeq.current) return;
            setItems([]);
            setError("Не удалось загрузить товары.");
        } finally {
            if (!mounted.current || seq !== requestSeq.current) return;
            setLoading(false);
        }
    }, [categoryId]);

    useEffect(() => {
        void load();
    }, [load]);

    return { items, loading, error, reload: load };
}