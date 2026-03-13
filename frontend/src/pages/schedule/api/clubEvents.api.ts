import { http } from "../../../shared/api/http";

type BackendClubEvent = {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    startsAt: string;
    endsAt: string;
    location?: string | null;
    createdByUserId: string;
};

export type ClubEventItem = {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    startsAt: string;
    endsAt: string;
    location?: string | null;
    createdByUserId: string;
};

export type CreateClubEventPayload = {
    title: string;
    description?: string;
    type: string;
    startsAt: string;
    endsAt: string;
    location?: string;
};

export type CreateCoachTrainingPayload = {
    title: string;
    description?: string;
    startsAt: string;
    endsAt: string;
    location?: string;
};

function mapEvent(item: BackendClubEvent): ClubEventItem {
    return {
        id: item.id,
        title: item.title,
        description: item.description ?? null,
        type: item.type,
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        location: item.location ?? null,
        createdByUserId: item.createdByUserId,
    };
}

export async function fetchClubEvents(): Promise<ClubEventItem[]> {
    const response = await http.get<BackendClubEvent[]>("/events");
    return (response.data ?? []).map(mapEvent);
}

export async function createClubEvent(payload: CreateClubEventPayload): Promise<string> {
    const response = await http.post<string>("/admin/events", payload);
    return response.data;
}

export async function createCoachTrainingEvent(payload: CreateCoachTrainingPayload): Promise<string> {
    const response = await http.post<string>("/trainer/events", payload);
    return response.data;
}

export async function deleteClubEvent(id: string): Promise<void> {
    await http.delete(`/admin/events/${id}`);
}

export async function deleteCoachTrainingEvent(id: string): Promise<void> {
    await http.delete(`/trainer/events/${id}`);
}
