import { useEffect, useState } from "react";
import { getHomePulseSource } from "../api/homePulse.api";
import { toHomePulseItems } from "../homePulse.helpers";
import type { HomePulseItem } from "./homePulse.types";

type UseHomePulseResult = {
    items: HomePulseItem[];
    isLoading: boolean;
    error: string | null;
    reload: () => void;
};

export function useHomePulse(): UseHomePulseResult {
    const [items, setItems] = useState<HomePulseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    function reload() {
        setIsLoading(true);
        setError(null);

        getHomePulseSource()
            .then((events) => setItems(toHomePulseItems(events)))
            .catch(() => setError("Не удалось загрузить актуальные события клуба."))
            .finally(() => setIsLoading(false));
    }

    useEffect(() => {
        reload();
    }, []);

    return {
        items,
        isLoading,
        error,
        reload,
    };
}
