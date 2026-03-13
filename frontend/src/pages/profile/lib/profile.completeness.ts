// frontend/src/pages/profile/lib/profile.completeness.ts
import type { MeResponse } from "../../../shared/api/account.api";

function normalizePhone(raw?: string | null): string {
    const s = (raw ?? "").trim();
    if (!s) return "";
    if (s.startsWith("+")) return "+" + s.slice(1).replace(/[^\d]/g, "");
    return s.replace(/[^\d]/g, "");
}

/**
 * Профиль считается заполненным, если:
 * - есть ник
 * - есть телефон
 * - выбран пол
 * - есть аватар (url или dataUrl)
 *
 * Дата рождения НЕ обязательна.
 */
export function isProfileComplete(me: MeResponse): boolean {
    const nicknameOk = Boolean(me.nickname?.trim());
    const phoneOk = Boolean(normalizePhone(me.phone));
    const genderOk = Boolean(me.gender);
    const avatarOk = Boolean(me.avatarUrl?.trim());

    return nicknameOk && phoneOk && genderOk && avatarOk;
}
