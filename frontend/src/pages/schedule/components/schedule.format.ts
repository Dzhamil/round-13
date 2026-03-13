import type { TrainingSessionResponse } from "../../../shared/api/training.api";

const dayFormatter = new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
});

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
});

function parseDate(iso: string): Date | null {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function getTrainingTypeLabel(type: TrainingSessionResponse["type"]): string {
    switch (type) {
        case "GROUP":
            return "Групповая";
        case "PERSONAL":
            return "Персональная";
        case "OPEN":
            return "Открытая";
        default:
            return type;
    }
}

export function formatSessionDay(iso: string): string {
    const date = parseDate(iso);
    if (!date) return "Дата не указана";
    return dayFormatter.format(date);
}

export function formatSessionTime(iso: string): string {
    const date = parseDate(iso);
    if (!date) return "--:--";
    return timeFormatter.format(date);
}

export function formatSessionTimeRange(startsAt: string, endsAt: string): string {
    return `${formatSessionTime(startsAt)} - ${formatSessionTime(endsAt)}`;
}

export function formatSessionDateTime(iso: string): string {
    const date = parseDate(iso);
    if (!date) return "Дата не указана";
    return dateTimeFormatter.format(date);
}
