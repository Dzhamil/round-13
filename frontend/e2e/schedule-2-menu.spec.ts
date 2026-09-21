import { expect, test, type Page } from "@playwright/test";
import { completedProfileIdentityFixture } from "../tests/fixtures/profileIdentity";

async function openHomeAs(page: Page, role: string): Promise<void> {
    await page.route("**/api/**", async (route) => {
        const pathname = new URL(route.request().url()).pathname;

        if (!pathname.startsWith("/api/")) {
            await route.continue();
            return;
        }

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
                ...completedProfileIdentityFixture,
            }
            : ["/api/events", "/api/events/history", "/api/account/events", "/api/verification/incoming"].includes(pathname)
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

test("trainer sees Schedule 2.0 button and opens the placeholder", async ({ page }) => {
    await openHomeAs(page, "COACH");

    const button = page.getByRole("link", { name: "Расписание 2.0" });
    await expect(button).toBeVisible();
    await expect(button).toHaveCSS("background-image", /linear-gradient/);

    await button.click();

    await expect(page).toHaveURL(/\/schedule-2$/);
    await expect(page.getByRole("heading", { name: "Расписание 2.0" })).toBeVisible();
    await expect(page.getByText("Расписание пока пусто.")).toBeVisible();
});

test("student does not see Schedule 2.0 button", async ({ page }) => {
    await openHomeAs(page, "ATHLETE");

    await expect(page.getByRole("link", { name: "Расписание 2.0" })).toHaveCount(0);
    const backgroundImage = await page.getByTestId("home-background").evaluate((element) =>
        getComputedStyle(element).backgroundImage,
    );
    expect(backgroundImage).toMatch(/round13-main-menu-background\.png/);
});

for (const path of ["/timetable", "/timetable/day/2026-09-22"]) {
    test(`retired route ${path} falls back to home without requesting legacy APIs`, async ({ page }) => {
        const legacyRequests: string[] = [];
        page.on("request", request => {
            if (/\/api\/(trainer\/(schedule|personal-trainings|events)|account\/schedule|training-sessions)/.test(request.url())) {
                legacyRequests.push(request.url());
            }
        });
        await openHomeAs(page, "COACH");
        await expect(page.locator('a[href^="/timetable"]')).toHaveCount(0);
        await page.goto(path);
        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole("link", { name: "Расписание 2.0" })).toBeVisible();
        expect(legacyRequests).toEqual([]);
    });
}

test("Schedule 2.0 has no attendance or legacy data requests", async ({ page }) => {
    const trainingRequests: string[] = [];
    page.on("request", request => {
        if (/\/api\/(schedule2\/trainings|trainer\/schedule|account\/schedule|training-sessions)/.test(request.url())) {
            trainingRequests.push(request.url());
        }
    });
    await openHomeAs(page, "COACH");
    await page.getByRole("link", { name: "Расписание 2.0" }).click();
    await expect(page.getByText("Расписание пока пусто.")).toBeVisible();
    await expect(page.getByRole("button", { name: /посещаемость|Добавить тренировку/i })).toHaveCount(0);
    expect(trainingRequests).toEqual([]);
});

test("Afisha keeps event controls without training creation or legacy queries", async ({ page }) => {
    const legacyRequests: string[] = [];
    page.on("request", request => {
        if (/\/api\/(trainer\/(schedule|events)|account\/schedule)/.test(request.url())) legacyRequests.push(request.url());
    });
    await openHomeAs(page, "ADMIN");
    await page.goto("/schedule");
    await expect(page.getByRole("button", { name: "Добавить событие" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Добавить тренировку" })).toHaveCount(0);
    await page.getByRole("button", { name: "Мои события", exact: true }).click();
    await page.getByRole("button", { name: "История", exact: true }).click();
    expect(legacyRequests).toEqual([]);
});
