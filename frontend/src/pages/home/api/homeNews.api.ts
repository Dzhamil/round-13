import { http } from "../../../shared/api/http";
import type { HomeNewsItem } from "../model/homeNews.types";

export async function getHomeNews(limit = 4): Promise<HomeNewsItem[]> {
    const { data } = await http.get<HomeNewsItem[]>("/news", {
        params: { limit },
    });

    return data;
}
