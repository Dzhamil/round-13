import { expect, test, type Page } from "@playwright/test";

async function openHomeAs(page: Page, role: string): Promise<void> {
    await page.route("**/api/**", async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        const body = pathname === "/api/account/me"
            ? {
                id: `${role.toLowerCase()}-user`,
                phone: "+79990000000",
                nickname: "Schedule Tester",
                role,
                status: "ACTIVE",
                avatarUrl: "https://example.test/avatar.png",
                gender: "MALE",
                profileCompleted: true,
            }
            : pathname === "/api/events" || pathname === "/api/account/events"
                ? []
                : {};

        await route.fulfill({
            body: JSON.stringify(body),
            contentType: "application/json",
            status: 200,
        });
    });

    await page.addInitScript(() => {
        localStorage.setItem("accessToken", "schedule-2-test-token");
        localStorage.setItem("refreshToken", "schedule-2-test-refresh-token");

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

    await page.goto("/");
    await page.waitForFunction(() => document.querySelector("header") !== null);
}

test("trainer opens Schedule 2.0 with empty switchable tabs", async ({ page }) => {
    await openHomeAs(page, "COACH");

    const button = page.getByRole("link", { name: "Расписание 2.0" });
    await expect(button).toBeVisible();
    await expect(button).toHaveCSS("background-image", /linear-gradient/);

    await button.click();

    await expect(page).toHaveURL(/\/schedule-2$/);
    await expect(page.getByRole("button", { name: "Назад" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Расписание 2.0" })).toBeVisible();

    const dayTab = page.getByRole("tab", { name: "День" });
    const weekTab = page.getByRole("tab", { name: "Неделя" });
    const monthTab = page.getByRole("tab", { name: "Месяц" });

    await expect(dayTab).toBeVisible();
    await expect(weekTab).toBeVisible();
    await expect(monthTab).toBeVisible();
    await expect(dayTab).toHaveAttribute("aria-selected", "true");

    await weekTab.click();
    await expect(weekTab).toHaveAttribute("aria-selected", "true");
    await expect(dayTab).toHaveAttribute("aria-selected", "false");

    await monthTab.click();
    await expect(monthTab).toHaveAttribute("aria-selected", "true");
    await expect(weekTab).toHaveAttribute("aria-selected", "false");
});

test("admin sees Schedule 2.0 button", async ({ page }) => {
    await openHomeAs(page, "ADMIN");

    await expect(page.getByRole("link", { name: "Расписание 2.0" })).toBeVisible();
});

test("student does not see Schedule 2.0 button", async ({ page }) => {
    await openHomeAs(page, "ATHLETE");

    await expect(page.getByRole("link", { name: "Расписание 2.0" })).toHaveCount(0);
});
