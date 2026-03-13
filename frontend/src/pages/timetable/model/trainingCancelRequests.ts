export type TrainingCancelRequest = {
    id: string;
    sessionId: string;
    studentId: string;
    studentName: string;
    coachId: string;
    coachName: string;
    startsAt: string;
    createdAt: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED";
};

const STORAGE_KEY = "round13:timetable:cancel-requests";

function canUseStorage(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseStored(value: string | null): TrainingCancelRequest[] {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeAll(items: TrainingCancelRequest[]) {
    if (!canUseStorage()) {
        return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function loadTrainingCancelRequests(): TrainingCancelRequest[] {
    if (!canUseStorage()) {
        return [];
    }

    return parseStored(window.localStorage.getItem(STORAGE_KEY));
}

export function saveTrainingCancelRequest(item: TrainingCancelRequest): TrainingCancelRequest[] {
    const current = loadTrainingCancelRequests();
    const next = current.filter((request) => request.id !== item.id);
    next.unshift(item);
    writeAll(next);
    return next;
}

export function updateTrainingCancelRequestStatus(
    requestId: string,
    status: "ACCEPTED" | "DECLINED",
): TrainingCancelRequest[] {
    const next = loadTrainingCancelRequests().map((item) =>
        item.id === requestId
            ? {
                ...item,
                status,
            }
            : item,
    );
    writeAll(next);
    return next;
}
