import type { MyScheduleItem } from "../../mySchedule/model/mySchedule.types";
import type { TrainerScheduleItem } from "./trainerSchedule.types";

export type TimetableTrainingItem = MyScheduleItem | TrainerScheduleItem;

function cleanText(value?: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

export function getTrainingTitle(item: TimetableTrainingItem): string | null {
    return cleanText(item.title);
}

export function getTrainingCounterpartyName(item: TimetableTrainingItem, isCoach: boolean): string | null {
    if (isCoach) {
        return cleanText((item as TrainerScheduleItem).studentName);
    }

    return cleanText((item as MyScheduleItem).coachName);
}

export function getTrainingPrimaryLabel(item: TimetableTrainingItem, isCoach: boolean): string {
    return getTrainingTitle(item) ?? getTrainingCounterpartyName(item, isCoach) ?? "Тренировка";
}

export function getTrainingSecondaryLabel(item: TimetableTrainingItem, isCoach: boolean): string | null {
    const name = getTrainingCounterpartyName(item, isCoach);
    if (!name) {
        return null;
    }

    return `${isCoach ? "Ученик" : "Тренер"}: ${name}`;
}

export function getTrainingLocation(item: TimetableTrainingItem): string | null {
    return cleanText(item.location);
}

export function formatTrainingTimeRange(item: TimetableTrainingItem): string {
    const start = item.startsAt?.slice(11, 16) ?? "";
    const end = item.endsAt?.slice(11, 16) ?? "";
    if (start && end) {
        return `${start}-${end}`;
    }

    return start;
}
