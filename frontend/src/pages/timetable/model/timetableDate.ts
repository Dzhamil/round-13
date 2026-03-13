export function toLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function parseIsoDateLocal(value?: string | null): Date {
    if (!value) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    const datePart = value.split("T")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);

        if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
            const parsed = new Date(year, month - 1, day);
            parsed.setHours(0, 0, 0, 0);
            return parsed;
        }
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    parsed.setHours(0, 0, 0, 0);
    return parsed;
}

function toOffsetSuffix(date: Date): string {
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absolute = Math.abs(offsetMinutes);
    const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
    const minutes = String(absolute % 60).padStart(2, "0");
    return `${sign}${hours}:${minutes}`;
}

export function combineLocalDateAndTime(dateIso: string, time: string): string {
    const baseDate = parseIsoDateLocal(dateIso);
    const [hoursPart, minutesPart] = time.split(":");
    const hours = Number(hoursPart ?? "0");
    const minutes = Number(minutesPart ?? "0");
    baseDate.setHours(
        Number.isNaN(hours) ? 0 : hours,
        Number.isNaN(minutes) ? 0 : minutes,
        0,
        0,
    );

    return `${toLocalIsoDate(baseDate)}T${String(baseDate.getHours()).padStart(2, "0")}:${String(baseDate.getMinutes()).padStart(2, "0")}:00${toOffsetSuffix(baseDate)}`;
}

export function startOfDayIso(dateIso: string): string {
    return combineLocalDateAndTime(dateIso, "00:00");
}

export function endOfDayIso(dateIso: string): string {
    const baseDate = parseIsoDateLocal(dateIso);
    baseDate.setHours(23, 59, 59, 0);
    return `${toLocalIsoDate(baseDate)}T23:59:59${toOffsetSuffix(baseDate)}`;
}

export function addDays(dateIso: string, days: number): string {
    const date = parseIsoDateLocal(dateIso);
    date.setDate(date.getDate() + days);
    return toLocalIsoDate(date);
}

export function monthStartIso(dateIso: string): string {
    const date = parseIsoDateLocal(dateIso);
    date.setDate(1);
    return toLocalIsoDate(date);
}

export function nextMonthStartIso(dateIso: string): string {
    const date = parseIsoDateLocal(dateIso);
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    return toLocalIsoDate(date);
}

export function todayIso(): string {
    return toLocalIsoDate(new Date());
}
