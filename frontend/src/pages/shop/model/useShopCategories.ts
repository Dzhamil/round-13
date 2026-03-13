import { useCallback, useEffect, useRef, useState } from "react";
import type { ShopCategoryResponse } from "../api/category.api";
import { fetchShopCategories } from "../api/category.api";

export function useShopCategories() {
    const [categories, setCategories] = useState<ShopCategoryResponse[]>([]);
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
            const data = await fetchShopCategories();
            if (!mounted.current || seq !== requestSeq.current) return;
            setCategories(data);
        } catch {
            if (!mounted.current || seq !== requestSeq.current) return;
            setCategories([]);
            setError("Не удалось загрузить категории.");
        } finally {
            if (!mounted.current || seq !== requestSeq.current) return;
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return { categories, loading, error, reload: load };
}