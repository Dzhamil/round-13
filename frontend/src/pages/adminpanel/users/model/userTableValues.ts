import type { PanelUserListItem } from "../api/panelUsers.api";

export const USER_SORT_COLUMNS = [
    { key: "fullName", label: "ФИО" },
    { key: "nickname", label: "Ник" },
    { key: "phone", label: "Телефон" },
    { key: "roleCode", label: "Роль" },
    { key: "status", label: "Статус" },
] as const;
export type UserSortKey = typeof USER_SORT_COLUMNS[number]["key"];
export type UserSort = { key: UserSortKey; direction: "asc" | "desc" };

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
    const value = (user: PanelUserListItem) => sort.key === "fullName"
        ? userFullName(user) : user[sort.key]?.trim() || "";
    return [...users].sort((left, right) => {
        const a = value(left);
        const b = value(right);
        // Missing values stay last in both directions.
        if (!a || !b) return a ? -1 : b ? 1 : 0;
        return collator.compare(a, b) * (sort.direction === "asc" ? 1 : -1);
    });
}
