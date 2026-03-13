import { getClubEventKindLabel } from "../schedule/model/schedule.lib";
import type { ClubEventItem } from "../schedule/model/schedule.types";
import type { HomePulseItem } from "./model/homePulse.types";

const VISIBLE_ITEMS_LIMIT = 5;

function formatPulseDateTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "В афише клуба";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function resolvePulseLabel(type: string): string {
    switch (type) {
        case "ANNOUNCEMENT":
            return "Объявление";
        case "OPEN_TRAINING":
            return "Открыта тренировка";
        case "COMPETITION":
            return "Скоро соревнование";
        case "TRAINING_CAMP":
            return "Выезд клуба";
        case "COACH_TRAINING":
            return "Тренировка";
        case "CLUB_EVENT":
        default:
            return getClubEventKindLabel(type);
    }
}

function toPulseMeta(item: ClubEventItem): string {
    const parts = [formatPulseDateTime(item.startsAt)];

    if (item.location?.trim()) {
        parts.push(item.location.trim());
    }

    return parts.join(" • ");
}

export function toHomePulseItems(items: ClubEventItem[]): HomePulseItem[] {
    return items
        .slice()
        .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
        .slice(0, VISIBLE_ITEMS_LIMIT)
        .map((item) => ({
            id: item.id,
            label: resolvePulseLabel(item.type),
            title: item.title.trim() || getClubEventKindLabel(item.type),
            meta: toPulseMeta(item),
        }));
}
