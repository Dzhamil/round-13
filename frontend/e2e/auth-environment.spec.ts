import { expect, test, type Page } from "@playwright/test";

// Transport fixture only: Telegram signatures are validated by the backend.
const MOCK_INIT_DATA = "query_id=mock-query&user=%7B%22id%22%3A123456789%7D&auth_date=1788516000&hash=mock-signature";
const LOGIN_ERROR = "Не удалось войти через Telegram. Попробуйте открыть приложение заново или обратитесь в клуб.";
const TOKENS = { accessToken: "auth-access-token", refreshToken: "auth-refresh-token" };

function telegramLaunchHash(initData = MOCK_INIT_DATA): string {
    return `#${new URLSearchParams({
        tgWebAppData: initData,
        tgWebAppVersion: "8.0",
        tgWebAppPlatform: "tdesktop",
    }).toString()}`;
}

async function openAuthPage(page: Page, hash = ""): Promise<void> {
    await page.goto(`/auth${hash}`);
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
}

async function expectTelegramOnly(page: Page): Promise<void> {
    await expect(page.getByRole("heading", { name: "Вход через Telegram" })).toBeVisible();
    await expect(page.locator('input[type="tel"], input[type="password"], form')).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Подтвердить номер через Telegram" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Создать новый аккаунт" })).toHaveCount(0);
    await expect(page.getByText(/восстановить доступ|связать.*аккаунт|подтвердите.*номер/i)).toHaveCount(0);
}

async function mockProfile(page: Page, complete: boolean): Promise<void> {
    await page.route("**/api/account/me", (route) => route.fulfill({
        json: {
            id: "telegram-user", nickname: "telegram-user", role: "ATHLETE",
            status: complete ? "ACTIVE" : "PROFILE_INCOMPLETE",
            phone: complete ? "+79600563065" : null,
            gender: complete ? "MALE" : null,
            avatarUrl: complete ? "/avatar.png" : null,
        },
    }));
}

async function expectTokens(page: Page): Promise<void> {
    await expect.poll(() => page.evaluate(() => ({
        accessToken: localStorage.getItem("accessToken"),
        refreshToken: localStorage.getItem("refreshToken"),
    }))).toEqual(TOKENS);
}

test.describe("separate auth environments", () => {
    test("ordinary browser uses only phone/password login", async ({ page }) => {
        const authRequests: string[] = [];
        await page.route("**/api/auth/**", async (route) => {
            authRequests.push(new URL(route.request().url()).pathname);
            expect(route.request().postDataJSON()).toEqual({ phone: "+79393930920", password: "web-password" });
            await route.fulfill({ json: TOKENS });
        });
        await mockProfile(page, true);
        await openAuthPage(page);
        await expect(page.getByRole("heading", { name: "Вход в Round13" })).toBeVisible();
        await expect(page.getByText(/Telegram/)).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Подтвердить номер через Telegram" })).toHaveCount(0);
        await page.getByLabel("Телефон").fill("89393930920");
        await page.getByLabel("Пароль").fill("web-password");
        await page.getByRole("button", { name: "Войти", exact: true }).click();
        await expect(page).toHaveURL(/\/$/);
        await expectTokens(page);
        expect(authRequests).toEqual(["/api/auth/login"]);
    });

    for (const status of [404, 409, 500]) {
        test(`Telegram failure ${status} shows only neutral retry and retries initData login`, async ({ page }) => {
            const authRequests: string[] = [];
            await page.route("**/api/auth/**", async (route) => {
                authRequests.push(new URL(route.request().url()).pathname);
                expect(route.request().postDataJSON()).toEqual({ initData: MOCK_INIT_DATA });
                await route.fulfill({ status, json: { message: "Подтвердите номер для восстановления доступа" } });
            });
            await openAuthPage(page, telegramLaunchHash());
            await expect(page.getByText(LOGIN_ERROR, { exact: true })).toBeVisible();
            await expectTelegramOnly(page);
            expect(authRequests.length).toBeGreaterThan(0);
            const count = authRequests.length;
            await page.getByRole("button", { name: "Повторить вход через Telegram" }).click();
            await expect.poll(() => authRequests.length).toBeGreaterThan(count);
            await expect(page.getByText(LOGIN_ERROR, { exact: true })).toBeVisible();
            await expectTelegramOnly(page);
            expect(new Set(authRequests)).toEqual(new Set(["/api/auth/telegram-login"]));
            expect(await page.evaluate(() => localStorage.getItem("accessToken"))).toBeNull();
        });
    }

    test("Telegram loading and network failure never render web controls", async ({ page }) => {
        let failRequest!: () => void;
        const failure = new Promise<void>((resolve) => { failRequest = resolve; });
        await page.route("**/api/auth/telegram-login", async (route) => {
            await failure;
            await route.abort("failed");
        });
        await openAuthPage(page, telegramLaunchHash());
        await expect(page.getByRole("status")).toHaveText("Проверяем ваш Telegram-аккаунт…");
        await expectTelegramOnly(page);
        failRequest();
        await expect(page.getByText(LOGIN_ERROR, { exact: true })).toBeVisible();
        await expectTelegramOnly(page);
    });

    test("Telegram launch without initData stays in Telegram error state", async ({ page }) => {
        const requests: string[] = [];
        page.on("request", (request) => {
            if (request.url().includes("/api/auth/")) requests.push(request.url());
        });
        await openAuthPage(page, telegramLaunchHash(""));
        await expect(page.getByText(LOGIN_ERROR, { exact: true })).toBeVisible();
        await expectTelegramOnly(page);
        expect(requests).toEqual([]);
    });

    for (const complete of [true, false]) {
        test(`successful Telegram login stores tokens and opens ${complete ? "app" : "profile completion"}`, async ({ page }) => {
            let attempts = 0;
            await page.route("**/api/auth/telegram-login", async (route) => {
                expect(route.request().postDataJSON()).toEqual({ initData: MOCK_INIT_DATA });
                attempts += 1;
                await route.fulfill({ json: TOKENS });
            });
            await mockProfile(page, complete);
            await openAuthPage(page, telegramLaunchHash());
            await expect(page).toHaveURL(complete ? /\/$/ : /\/profile\/complete$/);
            await expectTokens(page);
            expect(attempts).toBeGreaterThan(0);
        });
    }
});
