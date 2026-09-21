import type { ClubEventItem } from "./schedule.types";
import type { MyEventItem } from "./schedule.types";

export function getClubEventKindLabel(type: string): string {
    switch (type) {
        case "COMPETITION":
            return "Соревнование";
        case "TRAINING_CAMP":
            return "Сборы / выезд";
        case "OPEN_TRAINING":
            return "Открытая тренировка";
        case "ANNOUNCEMENT":
            return "Объявление";
        case "CLUB_EVENT":
        default:
            return "Событие";
    }
}

export function mapClubEventItem(item: ClubEventItem): MyEventItem {
    return {
        id: item.id,
        title: item.title,
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        kind: "EVENT",
        kindLabel: getClubEventKindLabel(item.type),
        location: item.location ?? null,
    };
}

export function sortMyEvents(items: MyEventItem[]): MyEventItem[] {
    return [...items].sort((a, b) => {
        const left = new Date(a.startsAt).getTime();
        const right = new Date(b.startsAt).getTime();
        return left - right;
    });
}

export function sortHistoryEvents(items: MyEventItem[]): MyEventItem[] {
    return [...items].sort((a, b) => {
        const left = new Date(a.endsAt ?? a.startsAt).getTime();
        const right = new Date(b.endsAt ?? b.startsAt).getTime();
        return right - left;
    });
}

export function isPastScheduleItem(params: { startsAt: string; endsAt?: string | null }): boolean {
    const edge = new Date(params.endsAt ?? params.startsAt);
    if (Number.isNaN(edge.getTime())) {
        return false;
    }

    return edge.getTime() < Date.now();
}

export function formatEventDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export function formatEventTime(startsAt: string, endsAt?: string | null): string {
    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime())) {
        return startsAt;
    }

    const startLabel = start.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });

    if (!endsAt) {
        return startLabel;
    }

    const end = new Date(endsAt);
    if (Number.isNaN(end.getTime())) {
        return startLabel;
    }

    const endLabel = end.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `${startLabel} - ${endLabel}`;
}
