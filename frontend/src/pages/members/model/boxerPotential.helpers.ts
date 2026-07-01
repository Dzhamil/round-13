import axios from "axios";

export function formatPotentialScore(value: number | null | undefined): string {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "—";
    }
    return value.toLocaleString("ru-RU", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    });
}

export function formatPotentialDate(value: string | null | undefined): string {
    if (!value) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "—";
    }
    return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (typeof responseData === "object" && responseData !== null && "message" in responseData) {
            const message = responseData.message;
            if (typeof message === "string" && message.trim()) {
                return message;
            }
        }
    }
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }
    return fallback;
}
