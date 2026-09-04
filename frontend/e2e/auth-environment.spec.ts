import { expect, test, type Page, type TestInfo } from "@playwright/test";

const MOCK_INIT_DATA = "query_id=mock-query&user=%7B%22id%22%3A123456789%7D&auth_date=1788516000&hash=mock-signature";

function skipUnlessDesktop(testInfo: TestInfo): void {
    test.skip(testInfo.project.name !== "chromium-desktop-admin", "Runs in desktop Chromium");
}

async function openAuthPage(page: Page, hash = ""): Promise<void> {
    await page.goto(`/auth${hash}`);
    await page.getByRole("heading").waitFor();
}

test.describe("auth environment detection", () => {
    test("ordinary browser uses the web phone/password flow", async ({ page }, testInfo) => {
        skipUnlessDesktop(testInfo);

        await openAuthPage(page);

        await expect(page.getByRole("heading", { name: "Вход в Round13" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Войти", exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: "Привязать и войти" })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Восстановить пароль" })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Создать новый аккаунт" })).toHaveCount(0);
    });

    test("Telegram WebApp with initData uses the account linking flow", async ({ page }, testInfo) => {
        skipUnlessDesktop(testInfo);
        const telegramLaunchParams = new URLSearchParams({
            tgWebAppData: MOCK_INIT_DATA,
            tgWebAppVersion: "8.0",
            tgWebAppPlatform: "tdesktop",
        });
        await openAuthPage(page, `#${telegramLaunchParams.toString()}`);

        await expect(page.getByRole("heading", { name: "Уже есть аккаунт? Введите телефон и пароль" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Привязать и войти" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Восстановить пароль" })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Создать новый аккаунт" })).toBeVisible();
    });
});
