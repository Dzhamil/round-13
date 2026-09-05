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

    expect(page.viewportSize()).not.toBeNull();

    const home = page.getByTestId("home-page");
    await expect(home).toBeVisible();
    const backgroundLayer = page.getByTestId("home-background");
    await expect(backgroundLayer).toBeVisible();
    const metrics = await backgroundLayer.evaluate((element) => {
        const background = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        const parent = element.parentElement;
        return {
            viewport: [innerWidth, innerHeight],
            document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
            image: background.backgroundImage,
            size: background.backgroundSize,
            position: background.backgroundPosition,
            inset: [background.top, background.right, background.bottom, background.left],
            layer: [bounds.x, bounds.y, bounds.width, bounds.height],
            stacking: {
                layerZIndex: Number(background.zIndex),
                parentIsolation: parent ? getComputedStyle(parent).isolation : "",
                parentBackground: parent ? getComputedStyle(parent).backgroundColor : "",
                visibility: background.visibility,
                display: background.display,
                opacity: Number(background.opacity),
            },
        };
    });
    console.log(testInfo.project.name, JSON.stringify(metrics));
    await page.screenshot({ path: `/tmp/home-${testInfo.project.name}.png` });

    expect(metrics.image).toMatch(/round13-main-menu-background\.png/);
    expect(metrics.image).not.toMatch(/page-backgrounds\/main-menu\.png/);
    expect(metrics.size.split(", ").at(-1)).toBe("cover");
    expect(metrics.inset).toEqual(["0px", "0px", "0px", "0px"]);
    expect(metrics.layer).toEqual([0, 0, ...metrics.viewport]);
    expect(metrics.stacking.layerZIndex).toBeGreaterThanOrEqual(0);
    expect(metrics.stacking.parentIsolation).toBe("isolate");
    expect(metrics.stacking.parentBackground).toBe("rgba(0, 0, 0, 0)");
    expect(metrics.stacking.visibility).toBe("visible");
    expect(metrics.stacking.display).not.toBe("none");
    expect(metrics.stacking.opacity).toBeGreaterThan(0);
    expect(metrics.document[0]).toBe(metrics.viewport[0]);

    const menuPanel = page.getByTestId("home-menu-content");
    await expect(menuPanel).toBeVisible();
    expect(await menuPanel.evaluate((element) => Number(getComputedStyle(element).zIndex)))
        .toBeGreaterThan(metrics.stacking.layerZIndex);
});
