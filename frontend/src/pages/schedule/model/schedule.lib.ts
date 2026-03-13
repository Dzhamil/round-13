import type { ClubEventItem } from "./schedule.types";
import type { MyScheduleItem } from "../../mySchedule/model/mySchedule.types";
import type { TrainerScheduleItem } from "../../timetable/model/trainerSchedule.types";
import type { MyEventItem } from "./schedule.types";

export function getClubEventKindLabel(type: string): string {
    switch (type) {
        case "COACH_TRAINING":
            return "Тренировка";
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

export function getEventTitle(item: MyScheduleItem): string {
    const title = item.title?.trim();
    if (title) {
        return title;
    }

    if (item.type === "PERSONAL") {
        return "Персональная тренировка";
    }

    if (item.type === "OPEN") {
        return "Открытая тренировка";
    }

    return "Тренировка";
}

export function mapMyScheduleItem(item: MyScheduleItem): MyEventItem {
    return {
        id: item.sessionId,
        title: getEventTitle(item),
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        kind: "TRAINING",
        kindLabel: "Тренировка",
    };
}

export function mapTrainerScheduleItem(item: TrainerScheduleItem): MyEventItem {
    return {
        id: item.sessionId,
        title: item.studentName?.trim()
            ? `Тренировка с ${item.studentName.trim()}`
            : "Тренировка",
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        kind: "TRAINING",
        kindLabel: "Тренировка",
    };
}

export function mapClubEventItem(item: ClubEventItem): MyEventItem {
    return {
        id: item.id,
        title: item.title,
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        kind: item.type === "COACH_TRAINING" ? "TRAINING" : "EVENT",
        kindLabel: getClubEventKindLabel(item.type),
        location: item.location ?? null,
    };
}

export function mergeMyEvents(
    myScheduleItems: MyScheduleItem[],
    trainerScheduleItems: TrainerScheduleItem[],
    clubEventItems: ClubEventItem[] = []
): MyEventItem[] {
    const byId = new Map<string, MyEventItem>();

    for (const item of myScheduleItems) {
        byId.set(item.sessionId, mapMyScheduleItem(item));
    }

    for (const item of trainerScheduleItems) {
        if (!byId.has(item.sessionId)) {
            byId.set(item.sessionId, mapTrainerScheduleItem(item));
        }
    }

    for (const item of clubEventItems) {
        if (!byId.has(item.id)) {
            byId.set(item.id, mapClubEventItem(item));
        }
    }

    return Array.from(byId.values());
}

export function sortMyEvents(items: MyEventItem[]): MyEventItem[] {
    return [...items].sort((a, b) => {
        const left = new Date(a.startsAt).getTime();
        const right = new Date(b.startsAt).getTime();
        return left - right;
    });
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
