import { expect, test, type Page } from "@playwright/test";
import { completedProfileIdentityFixture } from "../tests/fixtures/profileIdentity";

const tokens = {
    accessToken: "telegram-access-token",
    refreshToken: "telegram-refresh-token",
};

async function installReducedMotion(page: Page): Promise<void> {
    await page.addInitScript(() => {
        const originalMatchMedia = window.matchMedia.bind(window);
        window.matchMedia = (query: string) => {
            if (query === "(prefers-reduced-motion: reduce)") {
                return {
                    addEventListener: () => undefined,
                    addListener: () => undefined,
                    dispatchEvent: () => false,
                    matches: true,
                    media: query,
                    onchange: null,
                    removeEventListener: () => undefined,
                    removeListener: () => undefined,
                };
            }

            return originalMatchMedia(query);
        };
    });
}

async function blockLocalTokenStorage(page: Page): Promise<void> {
    await page.addInitScript(() => {
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function setItem(key: string, value: string): void {
            if (this === window.localStorage && (key === "accessToken" || key === "refreshToken")) {
                throw new DOMException("Token localStorage is unavailable", "QuotaExceededError");
            }

            return originalSetItem.call(this, key, value);
        };
    });
}

test("continues Telegram login when localStorage token writes fail", async ({ page }) => {
    await installReducedMotion(page);
    await blockLocalTokenStorage(page);

    const diagnostics: string[] = [];
    let accountRequests = 0;

    await page.route("**/api/auth/telegram-diagnostics", async route => {
        diagnostics.push(route.request().postDataJSON().category);
        await route.fulfill({ status: 204 });
    });
    await page.route("**/api/auth/telegram-login", async route => {
        await route.fulfill({ json: tokens });
    });
    await page.route("**/api/account/me", async route => {
        accountRequests += 1;
        expect(route.request().headers().authorization).toBe(`Bearer ${tokens.accessToken}`);
        await route.fulfill({
            json: {
                id: "00000000-0000-0000-0000-000000000001",
                role: "ATHLETE",
                status: "ACTIVE",
                nickname: "Barboss101",
                phone: "+79867104949",
                gender: "MALE",
                avatarUrl: "https://example.test/avatar.png",
                profileCompleted: true,
                ...completedProfileIdentityFixture,
            },
        });
    });
    await page.route("**/api/events", async route => route.fulfill({ json: [] }));

    const hash = new URLSearchParams({
        tgWebAppPlatform: "ios",
        tgWebAppVersion: "9.6",
        tgWebAppData: "hash=test",
    });
    await page.goto(`/auth#${hash}`);
    await page.getByRole("button", { name: "Пропустить заставку" }).click();

    await expect.poll(() => accountRequests).toBeGreaterThanOrEqual(1);
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expect.poll(() => diagnostics.includes("token_storage_success")).toBe(true);
    await expect.poll(() => diagnostics.includes("post_login_navigation_started")).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem("accessToken"))).toBeNull();
    expect(await page.evaluate(() => sessionStorage.getItem("accessToken"))).toBe(tokens.accessToken);
});
