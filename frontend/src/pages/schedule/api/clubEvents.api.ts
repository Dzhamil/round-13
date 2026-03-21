import { http } from "../../../shared/api/http";
import type { ClubEventItem } from "../model/schedule.types";

type BackendClubEvent = {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    startsAt: string;
    endsAt: string;
    location?: string | null;
    createdByUserId: string;
    createdByName?: string | null;
    trainerUserId?: string | null;
    trainerName?: string | null;
    joinedByMe?: boolean | null;
    requiresGroupPackage?: boolean | null;
    remainingGroupTrainings?: number | null;
};

export type CreateClubEventPayload = {
    title: string;
    description?: string;
    type: string;
    startsAt: string;
    endsAt: string;
    location?: string;
    trainerId?: string;
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
        createdByName: item.createdByName ?? null,
        trainerUserId: item.trainerUserId ?? null,
        trainerName: item.trainerName ?? null,
        joinedByMe: item.joinedByMe ?? false,
        requiresGroupPackage: item.requiresGroupPackage ?? false,
        remainingGroupTrainings: item.remainingGroupTrainings ?? null,
    };
}

export async function fetchClubEvents(): Promise<ClubEventItem[]> {
    const response = await http.get<BackendClubEvent[]>("/events");
    return (response.data ?? []).map(mapEvent);
}

export async function fetchClubEventsHistory(): Promise<ClubEventItem[]> {
    const response = await http.get<BackendClubEvent[]>("/events/history");
    return (response.data ?? []).map(mapEvent);
}

export async function fetchMyClubEvents(): Promise<ClubEventItem[]> {
    const response = await http.get<BackendClubEvent[]>("/account/events");
    return (response.data ?? []).map(mapEvent);
}

export async function createClubEvent(payload: CreateClubEventPayload): Promise<string> {
    const response = await http.post<string>("/admin/events", payload);
    return response.data;
}

export async function updateClubEvent(id: string, payload: CreateClubEventPayload): Promise<void> {
    await http.put(`/admin/events/${id}`, payload);
}

export async function createCoachTrainingEvent(payload: CreateCoachTrainingPayload): Promise<string> {
    const response = await http.post<string>("/trainer/events", payload);
    return response.data;
}

export async function updateCoachTrainingEvent(id: string, payload: CreateCoachTrainingPayload): Promise<void> {
    await http.put(`/trainer/events/${id}`, payload);
}

export async function deleteClubEvent(id: string): Promise<void> {
    await http.delete(`/admin/events/${id}`);
}

export async function deleteCoachTrainingEvent(id: string): Promise<void> {
    await http.delete(`/trainer/events/${id}`);
}

export async function joinClubEvent(id: string): Promise<void> {
    await http.post(`/events/${id}/join`);
}

export async function cancelClubEvent(id: string): Promise<void> {
    await http.post(`/events/${id}/cancel`);
}
