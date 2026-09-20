import type { PanelUserListItem } from "../api/panelUsers.api";

export const USER_SORT_COLUMNS = [
    { key: "fullName", label: "ФИО" },
    { key: "nickname", label: "Ник" },
    { key: "phone", label: "Телефон" },
    { key: "admin", label: "Админ" },
    { key: "trainer", label: "Тренер" },
    { key: "status", label: "Статус" },
] as const;
export type UserSortKey = typeof USER_SORT_COLUMNS[number]["key"];
export type UserSort = { key: UserSortKey; direction: "asc" | "desc" };

export function isUserAdmin(user: PanelUserListItem): boolean {
    return user.roleCode === "ADMIN";
}

export function userFullName(user: PanelUserListItem): string {
    return [user.surname, user.firstName, user.patronymic]
        .map(value => value?.trim() ?? "").filter(Boolean).join(" ")
        || user.fullName?.trim() || "";
}

export function displayUserValue(value: string | null): string {
    return value?.trim() || "—";
}

const collator = new Intl.Collator("ru", { sensitivity: "base", numeric: true });

export function sortUsers(users: PanelUserListItem[], sort: UserSort | null): PanelUserListItem[] {
    if (!sort) return users;
    if (sort.key === "admin" || sort.key === "trainer") {
        const value = (user: PanelUserListItem) => sort.key === "admin" ? isUserAdmin(user) : user.trainer;
        return [...users].sort((left, right) =>
            (Number(value(left)) - Number(value(right))) * (sort.direction === "asc" ? 1 : -1));
    }
    const key = sort.key;
    const value = (user: PanelUserListItem) => key === "fullName"
        ? userFullName(user) : user[key]?.trim() || "";
    return [...users].sort((left, right) => {
        const a = value(left);
        const b = value(right);
        // Missing values stay last in both directions.
        if (!a || !b) return a ? -1 : b ? 1 : 0;
        return collator.compare(a, b) * (sort.direction === "asc" ? 1 : -1);
    });
}
