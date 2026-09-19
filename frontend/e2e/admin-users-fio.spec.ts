import { test, expect, type Page } from "@playwright/test";
import { adminUsersFioFixture as users, adminUsersSortOrderFixture as expected, adminUsersDisplayFixture } from "../tests/fixtures/adminUsers";
import { completedProfileIdentityFixture, paddedProfileIdentityFixture, profileContactFixture } from "../tests/fixtures/profileIdentity";
import { isProfileComplete } from "../src/pages/profile/lib/profile.completeness";
import { authAs } from "../tests/e2e/support/auth";
import { installMockApi } from "../tests/e2e/support/mockApi";
import { meResponse } from "../tests/e2e/support/apiFixtures";

async function gotoApp(page: Page, path: string) {
    await page.goto(path);
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    await expect(page.locator('[data-startup-splash="overlay"]')).toHaveCount(0);
}
async function openUsers(page: Page) {
    await page.addInitScript(() => localStorage.setItem("panelAccessToken", "qa-panel"));
    await installMockApi(page);
    await page.route("**/api/panel/users", route => route.fulfill({ json: users }));
    await gotoApp(page, "/admin/users");
    await expect(page.locator('[data-label="ID"]')).toHaveCount(4);
}
test("completeness requires each real name part despite legacy name and completed flag", () => {
    const me = meResponse("athlete");
    expect(isProfileComplete(me)).toBe(true);
    for (const key of ["surname", "firstName", "patronymic"] as const) {
        for (const value of [null, "", " \t "]) expect(isProfileComplete({ ...me, [key]: value })).toBe(false);
    }
});
test("separate values, legacy fallback, missing profiles and mobile layout", async ({ page }) => {
    await openUsers(page);
    await expect(page.getByText("Ник/Телефон", { exact: true })).toHaveCount(0);
    await expect(page.locator('[data-label="ФИО"]')).toHaveText(adminUsersDisplayFixture.fullNames);
    await expect(page.locator('[data-label="Ник"]')).toHaveText(adminUsersDisplayFixture.nicknames);
    await expect(page.locator('[data-label="Телефон"]')).toHaveText(adminUsersDisplayFixture.phones);
    await expect(page.getByRole("button", { name: /Сортировать: ID/ })).toHaveCount(0);
    for (const cell of await page.locator('[data-label]').all()) {
        const box = await cell.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    }
});
test("all five columns sort independently in both directions", async ({ page }) => {
    await openUsers(page);

    for (const [key, label] of [["fullName", "ФИО"], ["nickname", "Ник"], ["phone", "Телефон"], ["roleCode", "Роль"], ["status", "Статус"]]) {
        const mobile = page.viewportSize()!.width <= 1100;
        if (mobile) await page.getByLabel("Сортировка", { exact: true }).selectOption(key);
        else await page.getByRole("button", { name: `Сортировать: ${label}`, exact: true }).click();
        await expect(page.locator('[data-label="ID"]')).toHaveText(expected[key][0]);
        if (mobile) await page.getByRole("button", { name: "Изменить направление сортировки" }).click();
        else await page.getByRole("button", { name: `Сортировать: ${label}`, exact: true }).click();
        await expect(page.locator('[data-label="ID"]')).toHaveText(expected[key][1]);
    }
});
test("manual creation requires patronymic and rejects whitespace names", async ({ page }) => {
    await openUsers(page);
    await page.getByRole("button", { name: "+ Создать пользователя вручную" }).click();
    await expect(page.getByPlaceholder("Отчество", { exact: true })).toHaveAttribute("required", "");
    await page.getByPlaceholder("Фамилия", { exact: true }).fill(" ");
    await page.getByPlaceholder("Имя", { exact: true }).fill(completedProfileIdentityFixture.firstName);
    await page.getByPlaceholder("Отчество", { exact: true }).fill(completedProfileIdentityFixture.patronymic);
    await page.getByPlaceholder("Телефон", { exact: true }).fill(profileContactFixture.phone);
    await page.getByRole("button", { name: "Создать", exact: true }).click();
    await expect(page.getByText("Заполните фамилию, имя и отчество.")).toBeVisible();
});
test("completion requires typed FIO and sends trimmed name parts", async ({ page }) => {
    await authAs(page, "athlete");
    await installMockApi(page);
    let submitted: Record<string, unknown> | undefined;
    await page.route("**/api/account/complete-profile", async route => {
        submitted = route.request().postDataJSON();
        await route.fulfill({ json: meResponse("athlete") });
    });
    await gotoApp(page, "/profile/complete");
    await expect(page.getByLabel("Фамилия", { exact: true })).toHaveValue("");
    await page.getByRole("button", { name: "Сохранить профиль" }).click();
    await expect(page.getByText("Заполните фамилию, имя и отчество.")).toBeVisible();
    await page.getByLabel("Фамилия", { exact: true }).fill(paddedProfileIdentityFixture.surname);
    await page.getByLabel("Имя", { exact: true }).fill(paddedProfileIdentityFixture.firstName);
    await page.getByLabel("Отчество", { exact: true }).fill("   ");
    await page.getByRole("button", { name: "Сохранить профиль" }).click();
    expect(submitted).toBeUndefined();
    await page.getByLabel("Отчество", { exact: true }).fill(paddedProfileIdentityFixture.patronymic);
    await page.getByPlaceholder("Например, boxer").fill(profileContactFixture.nickname);
    await page.getByPlaceholder("+7 (999) 123-45-67").fill(profileContactFixture.phone);
    await page.getByText("Мужской", { exact: true }).click();
    await page.locator('input[type="file"]').setInputFiles({ name: "avatar.png", mimeType: "image/png",
        buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWZkAAAAASUVORK5CYII=", "base64") });
    await page.getByRole("button", { name: "Сохранить профиль" }).click();
    await expect.poll(() => submitted).toMatchObject({ ...completedProfileIdentityFixture, nickname: profileContactFixture.nickname });
});

test("parser rejects invalid profile name fields", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("panelAccessToken", "qa-panel"));
    await installMockApi(page);
    await page.route("**/api/panel/users", route => route.fulfill({ json: [{ ...users[0], patronymic: 123 }] }));
    await gotoApp(page, "/admin/users");
    await expect(page.getByText("Некорректный ответ сервера админ-панели")).toBeVisible();
    await expect(page.locator('[data-label="ID"]')).toHaveCount(0);
});
