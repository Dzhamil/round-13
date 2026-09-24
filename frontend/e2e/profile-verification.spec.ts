import { expect, test, type Page } from "@playwright/test";
import { completedProfileIdentityFixture } from "../tests/fixtures/profileIdentity";

async function setup(page: Page, required = true, keepIncomplete = false, overrides: Record<string, unknown> = {}) {
    let me = {
        id: "profile-verification", role: "COACH", status: "ACTIVE", nickname: "club_nickname",
        phone: "+79991234567", phoneHidden: true, gender: "MALE", birthDate: "2000-01-01",
        avatarUrl: "/images/profile-tabs/profile-tab-stats.png", fullName: "Legacy display name",
        surname: required ? "" : completedProfileIdentityFixture.surname,
        firstName: completedProfileIdentityFixture.firstName, patronymic: completedProfileIdentityFixture.patronymic,
        profileCompleted: !required, profileVerificationRequired: required,
        profileMissingFields: required ? ["surname"] : [],
        ...overrides,
    };
    await page.addInitScript(() => {
        localStorage.setItem("accessToken", "verification-test");
        localStorage.setItem("refreshToken", "verification-refresh");
    });
    await page.route(url => url.pathname.startsWith("/api/"), async route => {
        const path = new URL(route.request().url()).pathname;
        if (path === "/api/account/profile") {
            expect(route.request().method()).toBe("PATCH");
            const body = route.request().postDataJSON();
            expect(body.phoneHidden).toBe(true);
            me = { ...me, ...body, status: keepIncomplete ? "PROFILE_INCOMPLETE" : "ACTIVE", profileCompleted: !keepIncomplete,
                profileVerificationRequired: keepIncomplete, profileMissingFields: keepIncomplete ? ["birthDate"] : [] };
        }
        await route.fulfill({ json: path.startsWith("/api/account/") ? me : { items: [] } });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
}

test("incomplete user is redirected from home and activates through profile save", async ({ page }) => {
    await setup(page, true, false, { status: "PROFILE_INCOMPLETE" });
    await expect(page).toHaveURL(/\/profile\?verify=1/);
    await expect(page.getByRole("link", { name: "Расписание 2.0", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Заполнить профиль" }).click();
    await page.getByLabel("Фамилия", { exact: true }).fill(completedProfileIdentityFixture.surname);
    await page.getByRole("button", { name: "Сохранить", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "Назад", exact: true }).click();
    await expect(page.getByText("Расписание", { exact: true })).toBeVisible();
});

for (const field of ["surname", "firstName", "patronymic", "phone"]) {
    test(`legacy ACTIVE with missing ${field} cannot open a club route`, async ({ page }) => {
        await setup(page, false, false, { [field]: " " });
        await expect(page).toHaveURL(/\/profile\?verify=1/);
        await page.goto("/members");
        await page.getByRole("button", { name: "Пропустить заставку" }).click();
        await expect(page).toHaveURL(/\/profile\?verify=1/);
        await expect(page.getByRole("button", { name: "Заполнить профиль" })).toBeVisible();
    });
}

test("incomplete status restricts even a stale completed response", async ({ page }) => {
    await setup(page, false, false, { status: "PROFILE_INCOMPLETE" });
    await expect(page).toHaveURL(/\/profile\?verify=1/);
});

test("complete ACTIVE profile can open the main menu", async ({ page }) => {
    await setup(page, false);
    await expect(page.getByText("Расписание", { exact: true })).toBeVisible();
});

test("incomplete profile does not request restricted statistics or club sections", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", request => {
        const path = new URL(request.url()).pathname;
        if (path.startsWith("/api/")) requests.push(path);
    });
    await setup(page);
    await expect(page.getByRole("button", { name: "Заполнить профиль" })).toBeVisible();
    expect(requests.filter(path => path !== "/api/account/me")).toEqual([]);
});

test("four identity fields suffice without optional photo birthday gender or nickname", async ({ page }) => {
    await setup(page, true, false, { nickname: "", avatarUrl: null, birthDate: null, gender: null });
    await page.getByRole("button", { name: "Заполнить профиль" }).click();
    await page.getByLabel("Фамилия", { exact: true }).fill(completedProfileIdentityFixture.surname);
    await page.getByRole("button", { name: "Сохранить", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Заполнить профиль" })).toHaveCount(0);
});
