import { http } from "../../../shared/api/http";
import { isAnnouncement, toHomeNewsItem } from "../homeNews.helpers";
import type { HomeAnnouncementItem, HomeNewsItem } from "../model/homeNews.types";

export async function getHomeNews(limit = 4): Promise<HomeNewsItem[]> {
    const { data } = await http.get<HomeAnnouncementItem[]>("/events");
    return (data ?? [])
        .filter(isAnnouncement)
        .slice(0, limit)
        .map(toHomeNewsItem);
}
