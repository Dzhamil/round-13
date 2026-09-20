import { test, expect } from "@playwright/test";
import { adminUsersFioFixture } from "../tests/fixtures/adminUsers";
import { installMockApi } from "../tests/e2e/support/mockApi";

const blockedMessage = "Ваш аккаунт заблокирован. Вы не можете пользоваться приложением. Для разблокировки обратитесь к владельцу приложения.";

test("block, unblock, delete cancellation and confirmation refresh the user list", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("panelAccessToken", "qa-panel"));
    await installMockApi(page);
    let users = [{ ...adminUsersFioFixture[0], status: "ACTIVE" }];
    const actions: string[] = [];
    await page.route("**/api/panel/users**", async route => {
        const request = route.request();
        if (request.method() === "GET") return route.fulfill({ json: users });
        actions.push(request.method() + " " + new URL(request.url()).pathname);
        if (request.method() === "DELETE") users = [];
        else users[0].status = request.url().endsWith("/unblock") ? "ACTIVE" : "BLOCKED";
        await route.fulfill({ status: 204 });
    });
    await page.goto("/admin/users");
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    await page.getByRole("button", { name: "Заблокировать", exact: true }).click();
    await expect(page.locator('[data-label="Статус"]')).toHaveText("BLOCKED");
    await page.getByRole("button", { name: "Разблокировать", exact: true }).click();
    await expect(page.locator('[data-label="Статус"]')).toHaveText("ACTIVE");
    page.once("dialog", dialog => dialog.dismiss());
    await page.getByRole("button", { name: "Удалить", exact: true }).click();
    await expect(page.locator('[data-label="ID"]')).toHaveCount(1);
    expect(actions).toHaveLength(2);
    page.once("dialog", async dialog => {
        expect(dialog.message()).toContain("при новом входе будет регистрироваться заново");
        await dialog.accept();
    });
    await page.getByRole("button", { name: "Удалить", exact: true }).click();
    await expect(page.locator('[data-label="ID"]')).toHaveCount(0);
    expect(actions).toEqual([
        `POST /api/panel/users/${adminUsersFioFixture[0].id}/block`,
        `POST /api/panel/users/${adminUsersFioFixture[0].id}/unblock`,
        `DELETE /api/panel/users/${adminUsersFioFixture[0].id}`,
    ]);
});

for (const telegram of [false, true]) {
    test(`blocked ${telegram ? "Telegram" : "web"} login displays owner contact message`, async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem("accessToken", "obsolete-token"));
        await page.route("**/api/auth/*", route => {
            if (new URL(route.request().url()).pathname.endsWith("login")) {
                expect(route.request().headers().authorization).toBeUndefined();
            }
            return route.fulfill({ status: 403, json: { code: "USER_BLOCKED", message: blockedMessage } });
        });
        const hash = telegram ? `#${new URLSearchParams({ tgWebAppData: "user=%7B%22id%22%3A123%7D&hash=test",
            tgWebAppVersion: "8.0", tgWebAppPlatform: "tdesktop" })}` : "";
        await page.goto(`/auth${hash}`);
        await page.getByRole("button", { name: "Пропустить заставку" }).click();
        if (!telegram) {
            await page.getByLabel("Телефон").fill("89991234567");
            await page.getByLabel("Пароль").fill("password");
            await page.getByRole("button", { name: "Войти", exact: true }).click();
        }
        await expect(page.getByText(blockedMessage, { exact: true })).toBeVisible();
        expect(await page.evaluate(() => localStorage.getItem("accessToken"))).toBeNull();
    });
}

for (const restrictedAt of ["access", "refresh"] as const) {
    test(`blocked ${restrictedAt} token clears credentials and shows blocking notice`, async ({ page }) => {
        await page.addInitScript(() => {
            if (sessionStorage.getItem("seeded")) return;
            sessionStorage.setItem("seeded", "yes");
            localStorage.setItem("accessToken", "old-access");
            localStorage.setItem("refreshToken", "old-refresh");
        });
        let refreshRequests = 0;
        await page.route("**/api/**", async route => {
            const path = new URL(route.request().url()).pathname;
            if (path === "/api/auth/refresh") refreshRequests++;
            if (restrictedAt === "refresh" && path === "/api/account/me") {
                return route.fulfill({ status: 401, json: {} });
            }
            return route.fulfill({ status: 403, json: { code: "USER_BLOCKED", message: blockedMessage } });
        });
        await page.goto("/rules");
        await page.getByRole("button", { name: "Пропустить заставку" }).click();
        await expect(page).toHaveURL(/\/auth\?reason=blocked/);
        await page.getByRole("button", { name: "Пропустить заставку" }).click();
        await expect(page.getByText(blockedMessage, { exact: true })).toBeVisible();
        expect(refreshRequests).toBe(restrictedAt === "refresh" ? 1 : 0);
        expect(await page.evaluate(() => [localStorage.getItem("accessToken"), localStorage.getItem("refreshToken")]))
            .toEqual([null, null]);
    });
}

test("failed deletion keeps the user visible and displays the backend error", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("panelAccessToken", "qa-panel"));
    await installMockApi(page);
    await page.route("**/api/panel/users**", route => route.fulfill(route.request().method() === "DELETE"
        ? { status: 409, json: { message: "Не удалось удалить пользователя" } }
        : { json: [adminUsersFioFixture[0]] }));
    await page.goto("/admin/users");
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Удалить", exact: true }).click();
    await expect(page.getByText("Не удалось удалить пользователя", { exact: true })).toBeVisible();
    await expect(page.locator('[data-label="ID"]')).toHaveCount(1);
});
