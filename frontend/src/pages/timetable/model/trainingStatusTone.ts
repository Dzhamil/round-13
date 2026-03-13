export type TrainingStatusTone = "neutral" | "warning" | "danger" | "success";

export type DayMetaLabel = {
    text: string;
    tone: TrainingStatusTone;
};

export function getTrainingStatusTone(status?: string | null): TrainingStatusTone {
    if (status === "CANCEL_REQUESTED") {
        return "warning";
    }
    if (status === "CANCELLED_FREE" || status === "CANCELLED_LATE" || status === "NO_SHOW") {
        return "danger";
    }
    if (status === "ATTENDED") {
        return "success";
    }
    return "neutral";
}

function tonePriority(tone: TrainingStatusTone): number {
    if (tone === "danger") return 4;
    if (tone === "warning") return 3;
    if (tone === "success") return 2;
    return 1;
}

export function pickDominantTone(current: TrainingStatusTone, next: TrainingStatusTone): TrainingStatusTone {
    return tonePriority(next) > tonePriority(current) ? next : current;
}
