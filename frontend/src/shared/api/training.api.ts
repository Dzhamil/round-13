// frontend/src/shared/api/training.api.ts
import { http } from "./http";

type BackendTrainingSessionResponse = {
    id: string;
    title: string;
    description?: string | null;
    type: "GROUP" | "PERSONAL" | "OPEN" | string;
    startTime: string; // ISO datetime
    durationMinutes: number;
    capacity?: number | null;
    location?: string | null;
    coachUserId?: string | null;
    coachName?: string | null;
    participantsCount?: number | null;

    // появится после доработки бэка (не обязателен для совместимости)
    joinedByMe?: boolean | null;
};

export type TrainingSessionResponse = {
    id: string;
    title: string;
    type: "GROUP" | "PERSONAL" | "OPEN";
    startsAt: string; // ISO datetime
    endsAt: string; // ISO datetime
    coachId?: string | null;
    coachName?: string | null;
    location?: string | null;
    capacity?: number | null;
    participantsCount?: number | null;
    description?: string | null;

    // появится после доработки бэка (не обязателен для совместимости)
    joinedByMe?: boolean;
};

export type TrainingSessionsFilter = {
    type?: "GROUP" | "PERSONAL" | "OPEN";
    coachId?: string;
    from?: string; // ISO datetime
    to?: string; // ISO datetime

    // появится после доработки бэка (мои записи)
    mine?: boolean;
};

function addMinutes(iso: string, minutes: number): string {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() + (Number.isFinite(minutes) ? minutes : 0));
    return d.toISOString();
}

function mapSession(s: BackendTrainingSessionResponse): TrainingSessionResponse {
    const type = (s.type ?? "GROUP").toString().toUpperCase() as TrainingSessionResponse["type"];
    const startsAt = s.startTime;
    const endsAt = addMinutes(s.startTime, s.durationMinutes);

    return {
        id: s.id,
        title: s.title,
        type,
        startsAt,
        endsAt,
        coachId: s.coachUserId ?? null,
        coachName: s.coachName ?? null,
        location: s.location ?? null,
        capacity: s.capacity ?? null,
        participantsCount: s.participantsCount ?? null,
        description: s.description ?? null,
        joinedByMe: s.joinedByMe ?? undefined,
    };
}

export async function getTrainingSessions(
    filter: TrainingSessionsFilter = {}
): Promise<TrainingSessionResponse[]> {
    const { type, coachId, from, to, mine } = filter;

    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (coachId) params.coachId = coachId;
    if (from) params.from = from;
    if (to) params.to = to;
    if (mine != null) params.mine = String(Boolean(mine));

    const r = await http.get<BackendTrainingSessionResponse[]>("/training-sessions", { params });
    return (r.data ?? []).map(mapSession);
}

export async function getTrainingSessionById(id: string): Promise<TrainingSessionResponse> {
    const r = await http.get<BackendTrainingSessionResponse>(`/training-sessions/${id}`);
    return mapSession(r.data);
}

export async function joinTrainingSession(id: string): Promise<void> {
    await http.post(`/training-sessions/${id}/join`);
}

export async function cancelTrainingSession(id: string): Promise<void> {
    await http.post(`/training-sessions/${id}/cancel`);
}
