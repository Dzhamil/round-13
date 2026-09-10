import { expect, test } from "@playwright/test";

for (const hasInitData of [false, true]) {
    test(`unmount cancels ${hasInitData ? "login" : "initData wait"}`, async ({ page }) => {
        const events: { category: string }[] = [];
        let loginRequests = 0;
        await page.route("**/api/auth/telegram-diagnostics", async route => {
            events.push(route.request().postDataJSON());
            await route.fulfill({ status: 204 });
        });
        await page.route("**/api/auth/telegram-login", () => { loginRequests++; });
        const hash = new URLSearchParams({ tgWebAppPlatform: "ios", tgWebAppVersion: "8.0", tgWebAppData: hasInitData ? "hash=test" : "" });
        await page.goto(`/auth#${hash}`);
        await page.getByRole("button", { name: "Пропустить заставку" }).click();
        await expect(page.getByRole("status")).toBeVisible();
        if (hasInitData) await expect.poll(() => loginRequests).toBe(1);
        await page.evaluate(() => {
            history.pushState({}, "", "/admin/login");
            window.dispatchEvent(new PopStateEvent("popstate"));
        });
        await expect.poll(() => events.some(event => event.category === "aborted")).toBe(true);
        const count = loginRequests;
        await page.waitForTimeout(4500);
        expect(loginRequests).toBe(count);
        expect(events.some(event => event.category === "init_data_timeout")).toBe(false);
        expect(await page.evaluate(() => localStorage.getItem("accessToken"))).toBeNull();
    });
}
