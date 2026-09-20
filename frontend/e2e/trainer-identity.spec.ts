import { test, expect, type Page } from "@playwright/test";
import { adminUsersFlagsFixture } from "../tests/fixtures/adminUsers";
import { authAs } from "../tests/e2e/support/auth";
import { installMockApi } from "../tests/e2e/support/mockApi";

async function open(page: Page, path: string) {
    await page.goto(path);
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    await expect(page.locator('[data-startup-splash="overlay"]')).toHaveCount(0);
}

test("admin and trainer flags show all four combinations and change independently", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("panelAccessToken", "qa-panel"));
    await installMockApi(page);
    const users = adminUsersFlagsFixture.map(user => ({ ...user }));
    const actions: string[] = [];
    await page.route("**/api/panel/users", route => route.fulfill({ json: users }));
    await page.route("**/api/panel/users/*/*", route => {
        expect(route.request().method()).toBe("POST");
        const [, id, action] = new URL(route.request().url()).pathname.match(/users\/([^/]+)\/([^/]+)$/)!;
        const user = users.find(user => user.id === id)!;
        actions.push(`${id}/${action}`);
        switch (action) {
            case "grant-admin": user.roleCode = "ADMIN"; break;
            case "revoke-admin": user.roleCode = user.trainer ? "COACH" : "ATHLETE"; break;
            case "grant-coach":
                user.trainer = true;
                if (user.roleCode !== "ADMIN") user.roleCode = "COACH";
                break;
            case "revoke-coach":
                user.trainer = false;
                if (user.roleCode !== "ADMIN") user.roleCode = "ATHLETE";
                break;
            default: throw new Error(`Unexpected action: ${action}`);
        }
        return route.fulfill({ status: 204 });
    });
    await open(page, "/admin/users");
    // Locate by exact ID cell text, including when one ID is a prefix of another.
    const userRow = (id: string) => page.locator('[data-label="ID"]').filter({ hasText: new RegExp(`^${id}$`) }).locator("..");
    async function expectFlags(id: string, admin: boolean, trainer: boolean) {
        const target = userRow(id);
        await expect(target.locator('[data-label="Админ"]')).toHaveText(admin ? "Да" : "Нет");
        await expect(target.locator('[data-label="Тренер"]')).toHaveText(trainer ? "Да" : "Нет");
        await expect(target.getByRole("button", { name: admin ? "Убрать админские права" : "Назначить админом", exact: true })).toBeVisible();
        await expect(target.getByRole("button", { name: trainer ? "Убрать тренерские права" : "Назначить тренером", exact: true })).toBeVisible();
    }
    await expectFlags("user", false, false);
    await expectFlags("trainer", false, true);
    await expectFlags("admin", true, false);
    await expectFlags("admin-trainer", true, true);
    await expect(userRow("admin-trainer").locator('[data-label="ФИО"]')).toHaveText("Лемон боксинг");
    await expect(page.locator('[data-label="Роль"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Сортировать: Роль" })).toHaveCount(0);

    // Exercise every transition, including removing either flag while preserving the other.
    for (const id of ["user", "trainer", "admin", "admin-trainer"]) {
        const initial = adminUsersFlagsFixture.find(user => user.id === id)!;
        const admin = initial.roleCode === "ADMIN";
        const trainer = initial.trainer;
        await userRow(id).getByRole("button", { name: admin ? "Убрать админские права" : "Назначить админом", exact: true }).click();
        await expectFlags(id, !admin, trainer);
        await userRow(id).getByRole("button", { name: trainer ? "Убрать тренерские права" : "Назначить тренером", exact: true }).click();
        await expectFlags(id, !admin, !trainer);
        await userRow(id).getByRole("button", { name: admin ? "Назначить админом" : "Убрать админские права", exact: true }).click();
        await expectFlags(id, admin, !trainer);
        await userRow(id).getByRole("button", { name: trainer ? "Назначить тренером" : "Убрать тренерские права", exact: true }).click();
        await expectFlags(id, admin, trainer);
        expect(actions.slice(-4)).toEqual([
            `${id}/${admin ? "revoke-admin" : "grant-admin"}`,
            `${id}/${trainer ? "revoke-coach" : "grant-coach"}`,
            `${id}/${admin ? "grant-admin" : "revoke-admin"}`,
            `${id}/${trainer ? "grant-coach" : "revoke-coach"}`,
        ]);
    }
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
