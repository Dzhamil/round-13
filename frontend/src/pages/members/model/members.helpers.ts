import { BALANCE_EVENT_TITLES, OPERATIONAL_STATUS_LABELS, TRAINING_STATUS_LABELS } from "./members.constants";
import type {
    StudentOperationalStatus,
    StudentTrainingActivity,
    TrainingBalanceHistoryItem,
} from "./members.types";

export function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return "Не указано";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function buildBalanceHistoryTitle(item: TrainingBalanceHistoryItem): string {
    if (!item.eventType) {
        return item.delta > 0 ? "Начисление тренировок" : "Списание тренировок";
    }

    return BALANCE_EVENT_TITLES[item.eventType] ?? (item.delta > 0 ? "Начисление тренировок" : "Списание тренировок");
}

export function getTrainingStatusLabel(status: string | null): string {
    if (!status) {
        return "Статус не указан";
    }

    return TRAINING_STATUS_LABELS[status] ?? status;
}

export function getOperationalStatusLabel(code: StudentOperationalStatus["code"] | null | undefined): string {
    if (!code) {
        return "Без статуса";
    }

    return OPERATIONAL_STATUS_LABELS[code];
}

export function getOperationalStatusTone(code: StudentOperationalStatus["code"] | null | undefined) {
    switch (code) {
        case "ACTIVE":
            return "positive";
        case "LONG_ABSENT":
            return "danger";
        default:
            return "warning";
    }
}

export function buildOperationalStatusDescription(
    status: StudentOperationalStatus | null,
    remainingTrainings: number | null,
    nextTraining: StudentTrainingActivity | null,
): string {
    if (!status) {
        return "Недостаточно данных для оценки.";
    }

    if (status.code === "ACTIVE") {
        if (nextTraining) {
            return `Есть ближайшая запись: ${formatDateTime(nextTraining.startTime)}.`;
        }
        if (status.lastAttendedAt) {
            return `Последнее подтвержденное посещение: ${formatDateTime(status.lastAttendedAt)}.`;
        }
        return "Ученик в активной работе.";
    }

    if (status.code === "LONG_ABSENT") {
        if (status.lastAttendedAt) {
            return `Давно не был: последнее посещение ${formatDateTime(status.lastAttendedAt)}.`;
        }
        return "Нет подтвержденных посещений и нет ближайшей записи.";
    }

    if (remainingTrainings != null && remainingTrainings <= 1) {
        return `Остаток тренировок на исходе: ${remainingTrainings}.`;
    }
    if (status.lastAttendedAt) {
        return `Последнее подтвержденное посещение: ${formatDateTime(status.lastAttendedAt)}.`;
    }
    return "Стоит проверить темп посещений и договориться о следующем занятии.";
}

export function toNumericDraft(value: number | null | undefined): string {
    return String(value ?? 0);
}
