import type { MeResponse } from "../../../shared/api/account.api";

/** The backend owns verification rules; profileCompleted supports older API responses. */
export function isProfileComplete(me: MeResponse): boolean {
    if (me.status === "PROFILE_INCOMPLETE"
        || ![me.surname, me.firstName, me.patronymic, me.phone].every(value => value?.trim())) return false;
    return me.profileVerificationRequired !== undefined
        ? !me.profileVerificationRequired
        : me.profileCompleted === true;
}

export const profileFieldLabels: Record<string, string> = {
    surname: "Фамилия", firstName: "Имя", patronymic: "Отчество",
    birthDate: "Дата рождения", gender: "Пол", phone: "Телефон",
    nickname: "Никнейм", avatarUrl: "Фото профиля",
};
