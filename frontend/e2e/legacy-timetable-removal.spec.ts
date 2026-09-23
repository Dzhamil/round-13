import { expect, test, type Page } from "@playwright/test";
import { authAs } from "../tests/e2e/support/auth";
import { installMockApi } from "../tests/e2e/support/mockApi";
import { QA_CLUB_EVENT, type QaRole } from "../tests/e2e/support/apiFixtures";

async function openPage(page: Page, path: string) {
    await page.goto(path);
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    await expect(page.locator('[data-startup-splash="overlay"]')).toHaveCount(0);
}

for (const role of ["athlete", "coach", "admin"] as QaRole[]) {
    test(`${role}: retired URLs return home without legacy navigation or API requests`, async ({ page }) => {
        await authAs(page, role);
        await installMockApi(page, { role });
        const legacyRequests: string[] = [];
        page.on("request", request => {
            const path = new URL(request.url()).pathname;
            if (/^\/api\/(account\/schedule|trainer\/(schedule|personal-trainings))(\/|$)/.test(path)) {
                legacyRequests.push(path);
            }
        });
        for (const path of ["/timetable", "/timetable/day/2026-09-23"]) {
            await openPage(page, path);
            await expect(page).toHaveURL(/\/$/);
            await expect(page.getByTestId("home-background")).toBeVisible();
            await expect(page.getByText("Расписание", { exact: true })).toHaveCount(0);
            await expect(page.locator('a[href^="/timetable"]')).toHaveCount(0);
            await expect(page.getByRole("button", { name: "Добавить тренировку" })).toHaveCount(0);
        }
        await page.route("**/api/pages/*", route => route.fulfill({ json: {
            code: "newcomers", title: "Новичкам", content: "Памятка клуба", updatedAt: "2026-09-23T12:00:00Z",
        } }));
        await openPage(page, "/about/newcomers");
        await expect(page.getByRole("link", { name: "Посмотреть афишу" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Открыть тренировки" })).toHaveCount(0);
        expect(legacyRequests).toEqual([]);
    });

    test(`${role}: afisha personal events and history use club events only`, async ({ page }) => {
        await authAs(page, role);
        await installMockApi(page, { role });
        const requests: string[] = [];
        page.on("request", request => requests.push(new URL(request.url()).pathname));
        const future = { ...QA_CLUB_EVENT, id: "future", title: "Future club event", startsAt: "2099-01-01T12:00:00Z", endsAt: "2099-01-01T13:00:00Z" };
        const past = { ...future, id: "past", title: "Past club event", startsAt: "2000-01-01T12:00:00Z", endsAt: "2000-01-01T13:00:00Z" };
        await page.route("**/api/account/events", route => route.fulfill({ json: [future, past] }));
        await page.route("**/api/events/history", route => route.fulfill({ json: [past] }));
        await openPage(page, "/schedule");
        await page.getByRole("button", { name: "Мои события", exact: true }).click();
        await expect(page.getByText(future.title, { exact: true })).toBeVisible();
        await expect(page.getByText(past.title, { exact: true })).toHaveCount(0);
        await page.getByRole("button", { name: "История", exact: true }).click();
        await expect(page.getByText(past.title, { exact: true })).toHaveCount(1);
        await expect(page.getByText(future.title, { exact: true })).toHaveCount(0);
        expect(requests.some(path => /^\/api\/(account\/schedule|trainer\/(schedule|personal-trainings))(\/|$)/.test(path))).toBe(false);
    });
}
