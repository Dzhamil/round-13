import { http } from "../../../shared/api/http";
import type { ClubEventItem } from "../../schedule/model/schedule.types";

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

export async function getHomePulseSource(): Promise<ClubEventItem[]> {
    const response = await http.get<BackendClubEvent[]>("/events");
    return (response.data ?? []).map(mapEvent);
}
