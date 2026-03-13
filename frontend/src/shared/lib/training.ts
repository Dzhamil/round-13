// frontend/src/shared/lib/training.ts

export function toDateSafe(iso: string | undefined | null): Date | null {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
}

export function isStarted(startsAtIso: string | undefined | null, now: Date = new Date()): boolean {
    const d = toDateSafe(startsAtIso);
    if (!d) return false;
    return now.getTime() >= d.getTime();
}

export function remainingSeats(
    capacity: number | null | undefined,
    participantsCount: number | null | undefined
): number | null {
    if (capacity == null) return null;
    const used = Math.max(0, Number(participantsCount ?? 0));
    const cap = Math.max(0, Number(capacity));
    return Math.max(0, cap - used);
}

export function isFull(
    capacity: number | null | undefined,
    participantsCount: number | null | undefined
): boolean {
    if (capacity == null) return false;
    const cap = Math.max(0, Number(capacity));
    const used = Math.max(0, Number(participantsCount ?? 0));
    return used >= cap;
}

export function seatsLabel(
    capacity: number | null | undefined,
    participantsCount: number | null | undefined
): string {
    if (capacity == null) return "Без лимита";
    const cap = Math.max(0, Number(capacity));
    const used = Math.max(0, Number(participantsCount ?? 0));
    return `${used}/${cap}`;
}
