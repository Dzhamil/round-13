import { useEffect, useState } from "react";
import { getHomeNews } from "../api/homeNews.api";
import type { HomeNewsItem } from "./homeNews.types";

type UseHomeNewsResult = {
    news: HomeNewsItem[];
    isLoading: boolean;
    error: string | null;
    reload: () => void;
};

export function useHomeNews(): UseHomeNewsResult {
    const [news, setNews] = useState<HomeNewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    function reload() {
        setIsLoading(true);
        setError(null);

        getHomeNews()
            .then(setNews)
            .catch(() => setError("Не удалось загрузить новости клуба. Попробуйте обновить страницу."))
            .finally(() => setIsLoading(false));
    }

    useEffect(() => {
        reload();
    }, []);

    return {
        news,
        isLoading,
        error,
        reload,
    };
}
