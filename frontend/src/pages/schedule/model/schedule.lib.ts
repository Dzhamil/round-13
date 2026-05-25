import type { ClubEventItem } from "./schedule.types";
import type { MyScheduleItem } from "../../mySchedule/model/mySchedule.types";
import type { TrainerScheduleItem } from "../../timetable/model/trainerSchedule.types";
import type { MyEventItem } from "./schedule.types";

function cleanText(value?: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

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

export function getScheduleStatusLabel(status?: string | null): string | null {
    if (!status) {
        return null;
    }

    switch (status) {
        case "BOOKED":
            return "Записан";
        case "CANCEL_REQUESTED":
            return "Ожидает подтверждения отмены";
        case "CANCELLED_FREE":
            return "Отменено без списания";
        case "CANCELLED_LATE":
            return "Отменено со списанием";
        case "CANCELLED_BY_TRAINER":
            return "Отменено тренером";
        case "ATTENDED":
            return "Тренировка посещена";
        case "NO_SHOW":
            return "Неявка";
        default:
            return status;
    }
}

export function mapMyScheduleItem(item: MyScheduleItem): MyEventItem {
    const coachName = cleanText(item.coachName);

    return {
        id: item.sessionId,
        title: getEventTitle(item),
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        kind: "TRAINING",
        kindLabel: "Тренировка",
        location: item.location ?? null,
        status: item.status ?? null,
        statusLabel: getScheduleStatusLabel(item.status),
        personLabel: coachName ? `Тренер: ${coachName}` : null,
    };
}

export function mapTrainerScheduleItem(item: TrainerScheduleItem): MyEventItem {
    const studentName = cleanText(item.studentName);

    return {
        id: item.sessionId,
        title: cleanText(item.title) ?? (studentName ? `Тренировка с ${studentName}` : "Тренировка"),
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        kind: "TRAINING",
        kindLabel: "Тренировка",
        location: item.location ?? null,
        status: item.status ?? null,
        statusLabel: getScheduleStatusLabel(item.status),
        personLabel: studentName ? `Ученик: ${studentName}` : null,
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
