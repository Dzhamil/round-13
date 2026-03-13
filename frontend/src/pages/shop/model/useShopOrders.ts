import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMyShopOrders } from "../api/order.api";
import type { ShopOrderHistoryItem } from "./shop.types";

export function useShopOrders() {
    const [items, setItems] = useState<ShopOrderHistoryItem[]>([]);
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
            const data = await fetchMyShopOrders();
            if (!mounted.current || seq !== requestSeq.current) return;
            setItems(
                [...data].sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
            );
        } catch {
            if (!mounted.current || seq !== requestSeq.current) return;
            setItems([]);
            setError("Не удалось загрузить заказы.");
        } finally {
            if (!mounted.current || seq !== requestSeq.current) return;
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return { items, loading, error, reload: load };
}
