import { expect, test, type Page } from "@playwright/test";
import { authAs } from "../tests/e2e/support/auth";
import { installMockApi } from "../tests/e2e/support/mockApi";
import { QA_USERS } from "../tests/e2e/support/apiFixtures";

async function openEvents(page: Page, role: "coach" | "admin") {
    const requests: string[] = [];
    await authAs(page, role);
    await installMockApi(page, { role });
    const event = {
        id: "club-event", title: "Club meeting", type: "CLUB_EVENT",
        startsAt: "2099-09-23T18:00:00+03:00", endsAt: "2099-09-23T19:00:00+03:00",
        createdByUserId: QA_USERS.coach.id, joinedByMe: false,
    };
    await page.route("**/api/events", route => route.fulfill({ json: [event] }));
    page.on("request", request => {
        if (request.url().includes("/api/")) requests.push(`${request.method()} ${new URL(request.url()).pathname}`);
    });
    await page.route("**/api/events/club-event/*", route => route.fulfill({ status: 200, body: "" }));
    await page.route("**/api/admin/events/*", route => route.fulfill({ status: 200, body: "" }));
    await page.goto("/schedule");
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    await expect(page.locator('[data-startup-splash="overlay"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Club meeting/ })).toBeVisible();
    return requests;
}

test("coach can join club events but cannot create, edit or delete them", async ({ page }) => {
    const requests = await openEvents(page, "coach");
    await expect(page.getByRole("button", { name: "Добавить событие" })).toHaveCount(0);
    await page.getByRole("button", { name: /Club meeting/ }).click();
    await expect(page.getByRole("button", { name: "Редактировать", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Удалить", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Участвовать", exact: true }).click();
    await expect.poll(() => requests).toContain("POST /api/events/club-event/join");
});

test("admin can open club event creation, edit and delete club events", async ({ page }) => {
    const requests = await openEvents(page, "admin");
    await page.getByRole("button", { name: "Добавить событие", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Добавить событие", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /Club meeting/ }).click();
    await page.getByRole("button", { name: "Редактировать", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Редактировать событие" })).toBeVisible();
    await page.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
    await expect.poll(() => requests).toContain("PUT /api/admin/events/club-event");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: /Club meeting/ }).click();
    await page.getByRole("button", { name: "Удалить", exact: true }).click();
    await expect.poll(() => requests).toContain("DELETE /api/admin/events/club-event");
});
