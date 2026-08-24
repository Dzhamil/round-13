type GenderValue = "MALE" | "FEMALE" | "OTHER" | string | null | undefined;

export function formatProfileGender(gender: GenderValue): string {
    const normalized = String(gender ?? "").trim().toUpperCase();

    if (normalized === "M" || normalized === "MALE") {
        return "Мужской";
    }

    if (normalized === "F" || normalized === "FEMALE") {
        return "Женский";
    }

    return "Не указан";
}

export function formatProfileBirthDate(value: string | null | undefined): string {
    const normalized = value?.trim();

    if (!normalized) {
        return "Не указана";
    }

    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
        return "Не указана";
    }

    const [, year, month, day] = match;
    const parsed = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) {
        return "Не указана";
    }

    return `${day}.${month}.${year}`;
}

export function formatPhoneVisibility(phoneHidden: boolean | null | undefined): string {
    return phoneHidden ? "Скрыт" : "Виден";
}

export function isDuplicateProfileAlias(name: string | null | undefined, nickname: string | null | undefined): boolean {
    const normalizedName = normalizeProfileText(name);
    const normalizedNickname = normalizeProfileText(nickname);

    return Boolean(normalizedName && normalizedName === normalizedNickname);
}

function normalizeProfileText(value: string | null | undefined): string {
    return String(value ?? "").trim().toLocaleLowerCase("ru-RU");
}
