export function extractShopErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object") {
        if ("response" in error) {
            const response = (error as { response?: { data?: { message?: unknown } } }).response;
            const message = response?.data?.message;
            if (typeof message === "string" && message.trim().length > 0) {
                return message;
            }
        }

        if ("message" in error) {
            const message = (error as { message?: unknown }).message;
            if (typeof message === "string" && message.trim().length > 0) {
                return message;
            }
        }
    }

    return fallback;
}
