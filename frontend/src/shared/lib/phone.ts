const RUSSIAN_COUNTRY_CODE = "7";
const RUSSIAN_TRUNK_PREFIX = "8";
const RUSSIAN_MOBILE_PREFIX = "9";
const RUSSIAN_LOCAL_DIGITS = 10;
const RUSSIAN_FULL_DIGITS = 11;
const DISPLAY_PLACEHOLDER = "Телефон не указан";
const HIDDEN_PLACEHOLDER = "Телефон скрыт";

export function extractPhoneDigits(value: string | null | undefined): string {
    return (value ?? "").replace(/\D/g, "");
}

function toRussianDigits(value: string | null | undefined): string {
    const digits = extractPhoneDigits(value);

    if (!digits) {
        return "";
    }

    if (digits.length === RUSSIAN_LOCAL_DIGITS && digits.startsWith(RUSSIAN_MOBILE_PREFIX)) {
        return `${RUSSIAN_COUNTRY_CODE}${digits}`;
    }

    if (digits.startsWith(RUSSIAN_TRUNK_PREFIX)) {
        return `${RUSSIAN_COUNTRY_CODE}${digits.slice(1)}`.slice(0, RUSSIAN_FULL_DIGITS);
    }

    if (digits.startsWith(RUSSIAN_COUNTRY_CODE)) {
        return digits.slice(0, RUSSIAN_FULL_DIGITS);
    }

    if (digits.startsWith(RUSSIAN_MOBILE_PREFIX)) {
        return `${RUSSIAN_COUNTRY_CODE}${digits}`.slice(0, RUSSIAN_FULL_DIGITS);
    }

    return digits.slice(0, RUSSIAN_FULL_DIGITS);
}

export function normalizeRussianPhone(value: string | null | undefined): string | null {
    const digits = toRussianDigits(value);

    if (digits.length !== RUSSIAN_FULL_DIGITS || !digits.startsWith(RUSSIAN_COUNTRY_CODE)) {
        return null;
    }

    return `+${digits}`;
}

export function isValidRussianPhone(value: string | null | undefined): boolean {
    return normalizeRussianPhone(value) != null;
}

export function formatRussianPhone(value: string | null | undefined): string {
    const digits = toRussianDigits(value);

    if (!digits) {
        return "";
    }

    const local = digits.startsWith(RUSSIAN_COUNTRY_CODE) ? digits.slice(1) : digits;
    if (!local) {
        return "+7";
    }

    const parts = [`+7 (${local.slice(0, 3)}`];

    if (local.length >= 3) {
        parts[0] += ")";
    }

    if (local.length > 3) {
        parts.push(local.slice(3, 6));
    }

    if (local.length > 6) {
        parts[parts.length - 1] += `-${local.slice(6, 8)}`;
    }

    if (local.length > 8) {
        parts[parts.length - 1] += `-${local.slice(8, 10)}`;
    }

    return parts.join(" ");
}

export function maskRussianPhoneInput(value: string | null | undefined): string {
    return formatRussianPhone(value);
}

export function getPhoneDisplayText(
    phone: string | null | undefined,
    phoneHidden = false,
): string {
    if (phoneHidden) {
        return HIDDEN_PLACEHOLDER;
    }

    const formatted = formatRussianPhone(phone);
    return formatted || DISPLAY_PLACEHOLDER;
}

export function normalizePhone(value: string): string {
    return normalizeRussianPhone(value) ?? "";
}

export function isLikelyPhone(value: string): boolean {
    return isValidRussianPhone(value);
}
