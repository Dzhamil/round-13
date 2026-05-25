import { isAxiosError } from "axios";

type PanelApiErrorBody = {
    message?: unknown;
};

const TECHNICAL_MESSAGES = new Set([
    "bad credentials",
    "unauthorized",
    "forbidden",
]);

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function isTechnicalMessage(message: string): boolean {
    return TECHNICAL_MESSAGES.has(message.trim().toLowerCase());
}

export function extractPanelErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError<PanelApiErrorBody>(error)) {
        const message = error.response?.data?.message;
        if (isNonEmptyString(message) && !isTechnicalMessage(message)) {
            return message;
        }
    }

    if (error instanceof Error && isNonEmptyString(error.message) && !isTechnicalMessage(error.message)) {
        return error.message;
    }

    return fallback;
}

export function getPanelErrorStatus(error: unknown): number | undefined {
    if (!isAxiosError(error)) {
        return undefined;
    }

    return error.response?.status;
}
