import type { PanelUserListItem } from "../../src/pages/adminpanel/users/api/panelUsers.api";

export const adminUsersFioFixture = [
    { id: "user-1", surname: " Яковлев ", firstName: " Иван ", patronymic: " Иванович ", fullName: "Ignored legacy", nickname: "alpha", phone: "+79990000003", roleCode: "COACH", trainer: true, status: "ACTIVE" },
    { id: "user-2", surname: null, firstName: " ", patronymic: "", fullName: " Борисов Борис ", nickname: "zeta", phone: "+79990000001", roleCode: "ADMIN", trainer: false, status: "BLOCKED" },
    { id: "user-3", surname: null, firstName: null, patronymic: null, fullName: " ", nickname: " ", phone: "", roleCode: "ATHLETE", trainer: false, status: "PROFILE_INCOMPLETE" },
    { id: "user-4", surname: "Антонов", firstName: null, patronymic: null, fullName: "Ignored partial legacy", nickname: "beta", phone: "+79990000002", roleCode: "ATHLETE", trainer: false, status: "ACTIVE" },
] satisfies PanelUserListItem[];

export const adminUsersSortOrderFixture: Record<string, [string[], string[]]> = {
    fullName: [["user-4", "user-2", "user-1", "user-3"], ["user-1", "user-2", "user-4", "user-3"]],
    nickname: [["user-1", "user-4", "user-2", "user-3"], ["user-2", "user-4", "user-1", "user-3"]],
    phone: [["user-2", "user-4", "user-1", "user-3"], ["user-1", "user-4", "user-2", "user-3"]],
    roleCode: [["user-2", "user-3", "user-4", "user-1"], ["user-1", "user-3", "user-4", "user-2"]],
    status: [["user-1", "user-4", "user-2", "user-3"], ["user-3", "user-2", "user-1", "user-4"]],
};

export const adminUsersDisplayFixture = {
    fullNames: ["Яковлев Иван Иванович", "Борисов Борис", "—", "Антонов"],
    nicknames: ["alpha", "zeta", "—", "beta"],
    phones: ["+79990000003", "+79990000001", "—", "+79990000002"],
};
