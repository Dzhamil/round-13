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
    test(`${role}: afisha personal events and history use club events only`, async ({ page }) => {
        await authAs(page, role);
        await installMockApi(page, { role });
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
    });
}
