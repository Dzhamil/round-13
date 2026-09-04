import { expect, test, type Page, type TestInfo } from "@playwright/test";

const MOCK_INIT_DATA = "query_id=mock-query&user=%7B%22id%22%3A123456789%7D&auth_date=1788516000&hash=mock-signature";

function skipUnlessDesktop(testInfo: TestInfo): void {
    test.skip(testInfo.project.name !== "chromium-desktop-admin", "Runs in desktop Chromium");
}

async function openAuthPage(page: Page, hash = ""): Promise<void> {
    await page.goto(`/auth${hash}`);
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    await page.getByRole("heading").waitFor();
}

function telegramLaunchHash(): string {
    return `#${new URLSearchParams({
        tgWebAppData: MOCK_INIT_DATA,
        tgWebAppVersion: "8.0",
        tgWebAppPlatform: "tdesktop",
    }).toString()}`;
}

test.describe("auth environment detection", () => {
    test("ordinary browser uses the web phone/password flow", async ({ page }, testInfo) => {
        skipUnlessDesktop(testInfo);

        await openAuthPage(page);

        await expect(page.getByRole("heading", { name: "Вход в Round13" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Войти", exact: true })).toBeVisible();
        await expect(page.getByLabel("Телефон")).toBeVisible();
        await expect(page.getByLabel("Пароль")).toBeVisible();
        await expect(page.getByRole("button", { name: "Подтвердить номер через Telegram" })).toHaveCount(0);
    });

    test("Telegram WebApp with initData does not show the phone/password form", async ({ page }, testInfo) => {
        skipUnlessDesktop(testInfo);
        await page.route("**/api/auth/telegram-login", async (route) => {
            await route.fulfill({
                status: 404,
                contentType: "application/json",
                body: JSON.stringify({ code: "USER_NOT_FOUND", message: "Пользователь не найден", httpStatus: 404 }),
            });
        });
        await openAuthPage(page, telegramLaunchHash());

        await expect(page.getByRole("heading", { name: "Вход через Telegram" })).toBeVisible();
        await expect(page.getByLabel("Телефон")).toHaveCount(0);
        await expect(page.getByLabel("Пароль")).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Подтвердить номер через Telegram" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Создать новый аккаунт" })).toHaveCount(0);
    });

    test("successful Telegram login stores tokens and navigates home", async ({ page }, testInfo) => {
        skipUnlessDesktop(testInfo);
        await page.route("**/api/auth/telegram-login", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ accessToken: "telegram-access-token", refreshToken: "telegram-refresh-token" }),
            });
        });
        await page.route("**/api/account/me", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    id: "telegram-user",
                    phone: "+79600563065",
                    nickname: "telegram-user",
                    role: "BOXER",
                    status: "ACTIVE",
                    gender: "MALE",
                    avatarUrl: "/avatar.png",
                }),
            });
        });

        await page.goto(`/auth${telegramLaunchHash()}`);
        await page.getByRole("button", { name: "Пропустить заставку" }).click();

        await expect(page).toHaveURL(/\/$/);
        await expect.poll(() => page.evaluate(() => localStorage.getItem("accessToken"))).toBe("telegram-access-token");
        await expect.poll(() => page.evaluate(() => localStorage.getItem("refreshToken"))).toBe("telegram-refresh-token");
    });
});
