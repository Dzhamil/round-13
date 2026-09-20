import { expect, test } from "@playwright/test";
import { completedProfileIdentityFixture, paddedProfileIdentityFixture, completedProfileFullNameFixture, profileContactFixture } from "../fixtures/profileIdentity";
import type { PanelUserListItem } from "../../src/pages/adminpanel/users/api/panelUsers.api";
import { displayUserValue, sortUsers, userFullName, USER_SORT_COLUMNS } from "../../src/pages/adminpanel/users/model/userTableValues";
import { isProfileComplete } from "../../src/pages/profile/lib/profile.completeness";
import type { MeResponse } from "../../src/shared/api/account.api";

const user: PanelUserListItem = {
    id: "user", surname: null, firstName: null, patronymic: null, fullName: null,
    ...profileContactFixture, roleCode: "ATHLETE", trainer: false, status: "ACTIVE",
};

test("FIO uses trimmed profile parts, then legacy name, never nickname or phone", () => {
    expect(userFullName({ ...user, ...paddedProfileIdentityFixture, fullName: "Legacy" }))
        .toBe(completedProfileFullNameFixture);
    expect(userFullName({ ...user, surname: paddedProfileIdentityFixture.surname, fullName: "Legacy" })).toBe(completedProfileIdentityFixture.surname);
    expect(userFullName({ ...user, surname: " ", fullName: " Legacy " })).toBe("Legacy");
    expect(displayUserValue(userFullName(user))).toBe("—");
    expect(displayUserValue(null)).toBe("—");
    expect(displayUserValue("  ")).toBe("—");
});

for (const { key } of USER_SORT_COLUMNS) {
    if (key === "admin" || key === "trainer") continue;
    test(`sorts ${key} in both directions without changing input; missing values stay last`, () => {
        const first = { ...user, id: "first", [key]: "А2" };
        const second = { ...user, id: "second", [key]: "А10" };
        const missing = { ...user, id: "missing", [key]: " " };
        const users = [second, missing, first];
        expect(sortUsers(users, { key, direction: "asc" }).map(value => value.id)).toEqual(["first", "second", "missing"]);
        expect(sortUsers(users, { key, direction: "desc" }).map(value => value.id)).toEqual(["second", "first", "missing"]);
        expect(users.map(value => value.id)).toEqual(["second", "missing", "first"]);
    });
}

test("profile requires each explicit name part even with legacy name and stale completion flag", () => {
    const complete: MeResponse = {
        ...user, role: "ATHLETE", ...completedProfileIdentityFixture,
        gender: "MALE", avatarUrl: "avatar.jpg", fullName: "Legacy", profileCompleted: true,
    };
    expect(isProfileComplete(complete)).toBe(true);
    for (const key of ["surname", "firstName", "patronymic"] as const) {
        for (const missing of [null, undefined, "", " ", "\t\n"]) {
            expect(isProfileComplete({ ...complete, [key]: missing })).toBe(false);
        }
    }
});

for (const key of ["admin", "trainer"] as const) {
    test(`sorts ${key} as a boolean without changing input`, () => {
        const users = [
            { ...user, id: "both", roleCode: "ADMIN", trainer: true },
            { ...user, id: "neither" },
            { ...user, id: "admin", roleCode: "ADMIN" },
            { ...user, id: "trainer", trainer: true },
        ];
        const expected = key === "admin"
            ? [["neither", "trainer", "both", "admin"], ["both", "admin", "neither", "trainer"]]
            : [["neither", "admin", "both", "trainer"], ["both", "trainer", "neither", "admin"]];
        expect(sortUsers(users, { key, direction: "asc" }).map(value => value.id)).toEqual(expected[0]);
        expect(sortUsers(users, { key, direction: "desc" }).map(value => value.id)).toEqual(expected[1]);
        expect(users.map(value => value.id)).toEqual(["both", "neither", "admin", "trainer"]);
    });
}
