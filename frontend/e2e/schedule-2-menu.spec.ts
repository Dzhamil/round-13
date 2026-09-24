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
            : pathname === "/api/events" || pathname === "/api/account/events"
                || pathname === "/api/schedule2/trainings" || pathname === "/api/verification/incoming"
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

for (const role of ["COACH", "ADMIN", "ATHLETE"]) {
    test(`${role} opens Schedule 2.0 from the radial menu`, async ({ page }) => {
        await openHomeAs(page, role);

        await expect(page.getByRole("link", { name: "Расписание 2.0", exact: true })).toHaveCount(0);
        await expect(page.getByText("Расписание", { exact: true })).toBeVisible();
        const segment = page.getByTestId("radial-menu-segment-2");
        await expect(segment).toBeVisible();
        // Click the label coordinates: the SVG path owns pointer events.
        const label = await page.getByText("Расписание", { exact: true }).boundingBox();
        expect(label).not.toBeNull();
        await page.mouse.click(label!.x + label!.width / 2, label!.y + label!.height / 2);

        await expect(page).toHaveURL(/\/schedule-2$/);
        await expect(page.getByRole("heading", { name: "Расписание 2.0" })).toBeVisible();
        await expect(page.getByText("На этот день тренировок нет")).toBeVisible();
    });
}
