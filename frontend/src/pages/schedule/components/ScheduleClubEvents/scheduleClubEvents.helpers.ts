import { formatEventDate, formatEventTime, getClubEventKindLabel } from "../../model/schedule.lib";
import type { ClubEventItem } from "../../model/schedule.types";

export function getClubEventSummary(item: ClubEventItem): string {
    return `${getClubEventKindLabel(item.type)} • ${item.title} • ${formatEventDate(item.startsAt)} • ${formatEventTime(item.startsAt, item.endsAt)}`;
}

export function getClubEventTrainerLabel(item: ClubEventItem): string | null {
    return item.trainerName ?? item.createdByName ?? null;
}
