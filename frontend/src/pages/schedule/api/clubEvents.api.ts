import { http } from "../../../shared/api/http";

type BackendClubEvent = {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    startsAt: string;
    endsAt: string;
    location?: string | null;
};

export type ClubEventItem = {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    startsAt: string;
    endsAt: string;
    location?: string | null;
};

export type CreateClubEventPayload = {
    title: string;
    description?: string;
    type: string;
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
