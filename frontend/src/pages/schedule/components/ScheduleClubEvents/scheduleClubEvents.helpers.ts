import { formatEventDate, formatEventTime, getClubEventKindLabel } from "../../model/schedule.lib";
import type { ClubEventItem } from "../../model/schedule.types";

function cleanText(value: string | null | undefined): string | null {
    const text = value?.trim();
    return text ? text : null;
}

export function getClubEventSummary(item: ClubEventItem): string {
    return [
        getClubEventKindLabel(item.type),
        cleanText(item.title),
        formatEventDate(item.startsAt),
        formatEventTime(item.startsAt, item.endsAt),
        ...getClubEventPreviewRows(item),
    ].filter(Boolean).join(" • ");
}

export function getClubEventTrainerLabel(item: ClubEventItem): string | null {
    return cleanText(item.trainerName) ?? cleanText(item.createdByName);
}

export function getClubEventOwnerLabel(item: ClubEventItem): string | null {
    return cleanText(item.createdByName);
}

export function getClubEventLocationLabel(item: ClubEventItem): string | null {
    return cleanText(item.location);
}

export function getClubEventDescriptionPreview(item: ClubEventItem): string | null {
    return cleanText(item.description);
}

export function getClubEventPreviewRows(item: ClubEventItem): string[] {
    const rows: string[] = [];
    const location = getClubEventLocationLabel(item);
    const trainer = getClubEventTrainerLabel(item);
    const owner = getClubEventOwnerLabel(item);
    const description = getClubEventDescriptionPreview(item);

    if (location) {
        rows.push(`Место: ${location}`);
    }

    if (item.type === "COACH_TRAINING" && trainer) {
        rows.push(`Тренер: ${trainer}`);
    } else if (owner) {
        rows.push(`Организатор: ${owner}`);
    }

    if (description) {
        rows.push(description);
    }

    return rows;
}
