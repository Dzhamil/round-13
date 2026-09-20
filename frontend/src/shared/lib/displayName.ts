type ProfileIdentity = {
    surname?: string | null;
    firstName?: string | null;
    patronymic?: string | null;
    fullName?: string | null;
    displayName?: string | null;
    nickname?: string | null;
};

export function displayName(profile: ProfileIdentity): string {
    const name = [profile.surname, profile.firstName, profile.patronymic]
        .map(value => value?.trim()).filter(Boolean).join(" ");
    return name || profile.displayName?.trim() || profile.fullName?.trim() || profile.nickname?.trim() || "Без имени";
}
