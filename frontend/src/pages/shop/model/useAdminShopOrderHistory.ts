import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAdminShopOrderHistory } from "../api/order.api";
import type { PendingPurchaseRequest } from "./shop.types";

type Options = {
    enabled?: boolean;
};

export function useAdminShopOrderHistory(options?: Options) {
    const enabled = options?.enabled ?? true;
    const [items, setItems] = useState<PendingPurchaseRequest[]>([]);
    const [loading, setLoading] = useState(enabled);
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
        if (!enabled) {
            setItems([]);
            setError(null);
            setLoading(false);
            return;
        }

        const seq = ++requestSeq.current;
        setLoading(true);
        setError(null);

        try {
            const data = await fetchAdminShopOrderHistory();
            if (!mounted.current || seq !== requestSeq.current) return;
            setItems(
                [...data].sort(
                    (a, b) =>
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )
            );
        } catch {
            if (!mounted.current || seq !== requestSeq.current) return;
            setItems([]);
            setError("Не удалось загрузить историю покупок.");
        } finally {
            if (!mounted.current || seq !== requestSeq.current) return;
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        void load();
    }, [load]);

    return { items, loading, error, reload: load };
}
