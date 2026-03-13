const PHONE_LIMITS = {
    minDigits: 10,
    maxDigits: 15
} as const;

function extractDigits(value: string): string {
    return value.replace(/\D/g, "");
}

export function normalizePhone(value: string): string {
    const digits = extractDigits(value);
    return digits ? `+${digits}` : "";
}

export function isLikelyPhone(value: string): boolean {
    const length = extractDigits(value).length;
    return length >= PHONE_LIMITS.minDigits && length <= PHONE_LIMITS.maxDigits;
}
