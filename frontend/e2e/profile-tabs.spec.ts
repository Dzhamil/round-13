import { expect, test, type Page } from "@playwright/test";

async function setup(page: Page, role = "ATHLETE", memberRole = "ATHLETE") {
    const me = {
        id: "profile-test", nickname: "Tester", phone: "+79990000000",
        role, status: "ACTIVE", gender: "MALE", profileCompleted: true,
        avatarUrl: "/images/profile-tabs/profile-tab-stats.png", aboutMe: "Existing biography",
    };
    const member = { ...me, id: "member-test", nickname: "Target Member", roleCode: memberRole };
    await page.route("**/api/**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        if (!path.startsWith("/api/")) {
            await route.continue();
            return;
        }
        const body = path === "/api/account/me" || path === "/api/account/profile" ? me
            : path === "/api/members" ? { items: [member] }
            : path === "/api/members/member-test" ? member
            : path.includes("verification") ? [] : {};
        await route.fulfill({ json: body });
    });
    await page.addInitScript(() => {
        localStorage.setItem("accessToken", "profile-test-token");
        localStorage.setItem("refreshToken", "profile-test-refresh");
    });
}

async function open(page: Page, path: string) {
    await page.goto(path);
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
}

for (const width of [320, 390]) {
    test(`icon tabs switch content and fit ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await setup(page);
        await open(page, "/profile");
        const tabs = page.getByRole("tablist", { name: "Разделы профиля" });
        await expect(tabs.getByRole("tab")).toHaveCount(4);
        await expect(page.getByRole("tab", { name: "Общая статистика" })).toHaveAttribute("aria-selected", "true");
        for (const name of ["Общая статистика", "Потенциал боксёра", "Мои пакеты", "Верификация тренера"]) {
            await page.getByRole("tab", { name, exact: true }).click();
            await expect(page.getByRole("tabpanel")).toHaveCount(1);
            await expect(page.getByRole("tabpanel", { name, exact: true })).toBeVisible();
            const expectedContent = {
                "Общая статистика": "Посещено тренировок",
                "Потенциал боксёра": "Потенциал боксера",
                "Мои пакеты": "Пока нет активных пакетов.",
                "Верификация тренера": "Верификация и тренеры",
            }[name]!;
            await expect(page.getByRole("tabpanel").getByText(expectedContent, { exact: true })).toBeVisible();
            await expect(page.getByText(expectedContent, { exact: true })).toHaveCount(1);
            const metrics = await tabs.evaluate((element) => {
                const rect = element.getBoundingClientRect();
                return { left: rect.left, right: rect.right, width: innerWidth, fits: element.scrollWidth <= element.clientWidth };
            });
            expect(metrics.left).toBeGreaterThanOrEqual(0);
            expect(metrics.right).toBeLessThanOrEqual(width);
            expect(metrics.fits).toBe(true);
        }
        for (const img of await tabs.locator("img").all()) {
            expect(await img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
        }
        await page.getByRole("tab", { name: "Верификация тренера" }).press("Home");
        await expect(page.getByRole("tab", { name: "Общая статистика" })).toBeFocused();
        await expect(page.getByText("О себе", { exact: true })).toHaveCount(0);
        await expect(page.getByText("Existing biography")).toHaveCount(0);
        await page.screenshot({ path: test.info().outputPath(`profile-${width}.png`) });
        await page.getByRole("button", { name: "Настройки", exact: true }).click();
        await expect(page.getByRole("dialog").locator("textarea")).toHaveCount(0);
        const request = page.waitForRequest((req) => req.url().includes("/account/profile") && req.method() === "PATCH");
        await page.getByRole("button", { name: "Сохранить", exact: true }).click();
        expect((await request).postDataJSON()).not.toHaveProperty("aboutMe");
    });
}

test("coach can view and edit description", async ({ page }) => {
    await setup(page, "COACH");
    await open(page, "/profile");
    await expect(page.getByText("Existing biography")).toBeVisible();
    await page.getByRole("button", { name: "Настройки", exact: true }).click();
    await page.getByLabel("О себе", { exact: true }).fill("Updated coach description");
    const request = page.waitForRequest((req) => req.url().includes("/account/profile") && req.method() === "PATCH");
    await page.getByRole("button", { name: "Сохранить", exact: true }).click();
    expect((await request).postDataJSON().aboutMe).toBe("Updated coach description");
});

for (const role of ["ATHLETE", "COACH"]) {
    test(`admin viewing ${role} member uses displayed member role`, async ({ page }) => {
        await setup(page, "ADMIN", role);
        await open(page, "/members");
        await page.getByRole("button", { name: "Открыть карточку Target Member" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        if (role === "COACH") {
            await expect(page.getByText("Existing biography")).toBeVisible();
        } else {
            await expect(page.getByText("О себе", { exact: true })).toHaveCount(0);
            await expect(page.getByText("Existing biography")).toHaveCount(0);
        }
    });
}
