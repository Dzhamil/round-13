import type { HomeAnnouncementItem, HomeNewsItem } from "./model/homeNews.types";

const ANNOUNCEMENT_TYPE = "ANNOUNCEMENT";
const FALLBACK_NEWS_EXCERPT = "Подробности доступны в афише клуба.";

export function isAnnouncement(item: HomeAnnouncementItem): boolean {
    return item.type === ANNOUNCEMENT_TYPE;
}

export function toHomeNewsItem(item: HomeAnnouncementItem): HomeNewsItem {
    return {
        id: item.id,
        title: item.title,
        excerpt: item.description?.trim() || FALLBACK_NEWS_EXCERPT,
        publishedAt: item.startsAt,
    };
}

export function formatHomeNewsDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Без даты";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
    }).format(date);
}
