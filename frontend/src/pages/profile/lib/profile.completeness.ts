// frontend/src/pages/profile/lib/profile.completeness.ts
import type { MeResponse } from "../../../shared/api/account.api";
import { isValidRussianPhone } from "../../../shared/lib/phone";

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
    const phoneOk = isValidRussianPhone(me.phone);
    const genderOk = Boolean(me.gender);
    const avatarOk = Boolean(me.avatarUrl?.trim());

    return nicknameOk && phoneOk && genderOk && avatarOk;
}
