export function formatRequestedStartTime(value?: string | null): string | null {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function buildRequestedStartTime(dateValue: string, timeValue: string): Date | null {
    if (!dateValue || !timeValue) return null;

    const [year, month, day] = dateValue.split("-").map(Number);
    const [hours, minutes] = timeValue.split(":").map(Number);

    if (
        !Number.isInteger(year)
        || !Number.isInteger(month)
        || !Number.isInteger(day)
        || !Number.isInteger(hours)
        || !Number.isInteger(minutes)
    ) {
        return null;
    }

    const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
    if (Number.isNaN(date.getTime())) return null;

    return date;
}
