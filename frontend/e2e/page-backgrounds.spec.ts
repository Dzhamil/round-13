import { expect, test, type Page } from "@playwright/test";

async function openAuthenticatedPage(page: Page, pathname: string): Promise<void> {
    await page.route("**/api/**", async (route) => {
        const apiPath = new URL(route.request().url()).pathname;
        if (!apiPath.startsWith("/api/")) {
            await route.continue();
            return;
        }
        const body = apiPath === "/api/account/me"
            ? {
                id: "background-test-user",
                phone: "+79990000000",
                nickname: "Background Tester",
                role: "ATHLETE",
                status: "ACTIVE",
                avatarUrl: "https://example.test/avatar.png",
                gender: "MALE",
                profileCompleted: true,
            }
            : [];
        await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status: 200 });
    });
    await page.addInitScript(() => {
        localStorage.setItem("accessToken", "background-test-token");
        localStorage.setItem("refreshToken", "background-test-refresh-token");
    });
    await page.goto(pathname);
    const skipSplash = page.getByRole("button", { name: "Пропустить заставку" });
    await expect(skipSplash).toBeVisible();
    await skipSplash.click();
}

async function expectFullViewportBackground(page: Page, pathname: string, imageName: string): Promise<void> {
    await openAuthenticatedPage(page, pathname);
    const background = page.getByTestId("page-background");
    await expect(background).toBeVisible();
    const metrics = await background.evaluate((element) => {
        const style = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        return {
            image: style.backgroundImage,
            size: style.backgroundSize,
            bounds: [bounds.x, bounds.y, bounds.width, bounds.height],
            viewport: [innerWidth, innerHeight],
        };
    });
    expect(metrics.image).toContain(`/images/page-backgrounds/${imageName}`);
    expect(metrics.size.split(", ").at(-1)).toBe("cover");
    expect(metrics.bounds).toEqual([0, 0, ...metrics.viewport]);
}

test("/profile has a full-viewport page background", async ({ page }) => {
    await expectFullViewportBackground(page, "/profile", "profile.png");
});

test("/shop has a full-viewport page background", async ({ page }) => {
    await expectFullViewportBackground(page, "/shop", "shop.png");
});
