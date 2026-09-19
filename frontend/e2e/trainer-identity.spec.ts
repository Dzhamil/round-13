import { test, expect, type Page } from "@playwright/test";
import { adminUsersFioFixture } from "../tests/fixtures/adminUsers";
import { authAs } from "../tests/e2e/support/auth";
import { installMockApi } from "../tests/e2e/support/mockApi";

async function open(page: Page, path: string) {
    await page.goto(path);
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    await expect(page.locator('[data-startup-splash="overlay"]')).toHaveCount(0);
}

test("admin trainer controls are independent of management permission and reload identity", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("panelAccessToken", "qa-panel"));
    await installMockApi(page);
    const users = adminUsersFioFixture.map(user => ({ ...user }));
    users[3] = { ...users[3], roleCode: "ADMIN", trainer: true };
    await page.route("**/api/panel/users", route => route.fulfill({ json: users }));
    await page.route("**/api/panel/users/user-2/*", route => {
        expect(route.request().method()).toBe("POST");
        users[1].trainer = route.request().url().endsWith("/grant-coach");
        return route.fulfill({ status: 204 });
    });
    await open(page, "/admin/users");
    const row = (id: string) => page.locator('[data-label="ID"]').filter({ hasText: id }).locator("..");
    await expect(row("user-1").getByText("Тренер", { exact: true })).toBeVisible();
    await expect(row("user-2").getByText("Тренер", { exact: true })).toHaveCount(0);
    await expect(row("user-4").getByText("Тренер", { exact: true })).toBeVisible();
    await row("user-2").getByRole("button", { name: "Назначить тренером" }).click();
    await expect(row("user-2").getByText("Тренер", { exact: true })).toBeVisible();
    await expect(row("user-2").locator('[data-label="Роль"]')).toContainText("ADMIN");
    await row("user-2").getByRole("button", { name: "Убрать тренерские права" }).click();
    await expect(row("user-2").getByRole("button", { name: "Назначить тренером" })).toBeVisible();
    await expect(row("user-2").locator('[data-label="Роль"]')).toHaveText("ADMIN");
});

test("Telegram coaches tab renders server selection including an explicit admin trainer", async ({ page }) => {
    await authAs(page, "athlete");
    await installMockApi(page);
    let coachesRequested = false;
    await page.route("**/api/members?*", route => {
        const coaches = new URL(route.request().url()).searchParams.get("group") === "COACHES";
        coachesRequested ||= coaches;
        const items = (coaches ? [["coach", "COACH"], ["admin-trainer", "ADMIN"]] : [["athlete", "ATHLETE"]])
            .map(([nickname, roleCode]) => ({ id: nickname, nickname, roleCode, phone: null, phoneHidden: true,
                avatarUrl: null, points: 0, statusLabel: "—", remainingTrainings: null }));
        return route.fulfill({ json: { items } });
    });
    const hash = new URLSearchParams({ tgWebAppPlatform: "tdesktop", tgWebAppVersion: "8.0", tgWebAppData: "query_id=test&user=%7B%22id%22%3A123%7D&hash=test" });
    await open(page, `/members#${hash}`);
    await page.getByRole("button", { name: "Тренеры", exact: true }).click();
    await expect(page.getByRole("button", { name: "Открыть карточку coach", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Открыть карточку admin-trainer", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Открыть карточку / })).toHaveCount(2);
    expect(coachesRequested).toBe(true);
});
