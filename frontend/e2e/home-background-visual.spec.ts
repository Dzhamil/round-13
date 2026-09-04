import { expect, test } from "@playwright/test";

test("captures and verifies the home background viewport", async ({ page }, testInfo) => {
    await page.route("**/api/**", async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        if (!pathname.startsWith("/api/")) {
            await route.continue();
            return;
        }
        const body = pathname === "/api/account/me"
            ? {
                id: "visual-user",
                phone: "+79990000000",
                nickname: "Visual Tester",
                role: "ATHLETE",
                status: "ACTIVE",
                avatarUrl: "https://example.test/avatar.png",
                gender: "MALE",
                profileCompleted: true,
            }
            : {};
        await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status: 200 });
    });
    await page.addInitScript(() => {
        localStorage.setItem("accessToken", "visual-token");
        localStorage.setItem("refreshToken", "visual-refresh-token");
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Пропустить заставку" }).click();

    const home = page.getByTestId("home-page");
    await expect(home).toBeVisible();
    const metrics = await home.evaluate((element) => {
        const background = getComputedStyle(element, "::before");
        return {
            viewport: [innerWidth, innerHeight],
            document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
            image: background.backgroundImage,
            size: background.backgroundSize,
            position: background.backgroundPosition,
            inset: [background.top, background.right, background.bottom, background.left],
            layer: [background.width, background.height],
        };
    });
    console.log(testInfo.project.name, JSON.stringify(metrics));
    await page.screenshot({ path: `/tmp/home-${testInfo.project.name}.png` });

    expect(metrics.image).toMatch(/round13-main-menu-background\.png/);
    expect(metrics.size).toBe("cover");
    expect(metrics.inset).toEqual(["0px", "0px", "0px", "0px"]);
    expect(metrics.layer).toEqual(metrics.viewport.map((value) => `${value}px`));
    expect(metrics.document[0]).toBe(metrics.viewport[0]);
});
