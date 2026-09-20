import { test, expect, type Page, type Route } from "@playwright/test";
import { authAs } from "../tests/e2e/support/auth";
import { installMockApi } from "../tests/e2e/support/mockApi";

async function openMembers(page: Page) {
    await authAs(page, "coach");
    await installMockApi(page, { role: "coach" });
    const hash = new URLSearchParams({ tgWebAppPlatform: "tdesktop", tgWebAppVersion: "8.0", tgWebAppData: "query_id=test&user=%7B%22id%22%3A123%7D&hash=test" });
    await page.goto(`/members#${hash}`);
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    await expect(page.locator('[data-startup-splash="overlay"]')).toHaveCount(0);
}

function members(count: number) {
    return { items: Array.from({ length: count }, (_, index) => ({
        id: `member-${index}`, nickname: `Участник ${index}`, roleCode: "ATHLETE",
        phone: null, phoneHidden: true, avatarUrl: null, points: 0,
        statusLabel: "—", remainingTrainings: null,
    })) };
}

test("active tab counts include empty students and history, with no number while loading or on error", async ({ page }) => {
    // Register specific routes after the shared mock API, before navigation.
    await authAs(page, "coach");
    await installMockApi(page, { role: "coach" });
    let pending: Route | undefined;
    await page.route("**/api/members?*", route => {
        if (new URL(route.request().url()).searchParams.get("group") === "COACHES") {
            pending = route;
            return;
        }
        return route.fulfill({ json: members(3) });
    });
    await page.route("**/api/members/my-students", route => route.fulfill({ json: members(0) }));
    await page.route("**/api/trainer/students/history", route => route.fulfill({ json: { items: [{
        id: "history-1", studentId: "student-1", studentName: "Ученик", delta: 1,
        balanceAfter: 2, eventType: "ADJUSTMENT", createdByUserId: null,
        createdByName: null, createdAt: "2026-09-20T10:00:00Z",
    }] } }));
    const hash = new URLSearchParams({ tgWebAppPlatform: "tdesktop", tgWebAppVersion: "8.0", tgWebAppData: "query_id=test&user=%7B%22id%22%3A123%7D&hash=test" });
    await page.goto(`/members#${hash}`);
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    const summary = page.getByRole("status", { name: "Количество записей" });
    await expect(summary).toHaveText("Показано: 3");
    await page.getByRole("button", { name: "Тренеры", exact: true }).click();
    await expect(page.getByText("Загрузка…", { exact: true })).toBeVisible();
    await expect(summary).toHaveCount(0);
    await expect.poll(() => Boolean(pending)).toBe(true);
    await pending!.fulfill({ json: members(2) });
    await expect(summary).toHaveText("Показано: 2");
    await page.getByRole("button", { name: "Мои ученики", exact: true }).click();
    await expect(summary).toHaveText("Показано: 0");
    await page.getByRole("button", { name: "История", exact: true }).click();
    await expect(summary).toHaveText("Показано: 1");
    const box = (await summary.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    pending = undefined;
    await page.getByRole("button", { name: "Тренеры", exact: true }).click();
    await expect.poll(() => Boolean(pending)).toBe(true);
    await pending!.fulfill({ status: 500, json: { message: "Failed" } });
    await expect(page.getByText("Не удалось загрузить список. Попробуйте еще раз.")).toBeVisible();
    await expect(summary).toHaveCount(0);
});

test("late response from an inactive tab cannot replace the current count or rows", async ({ page }) => {
    await openMembers(page);
    let pending: Route | undefined;
    await page.route("**/api/members?*", route => {
        if (new URL(route.request().url()).searchParams.get("group") === "COACHES") {
            pending = route;
            return;
        }
        return route.fulfill({ json: members(3) });
    });
    await page.getByRole("button", { name: "Тренеры", exact: true }).click();
    await expect.poll(() => Boolean(pending)).toBe(true);
    await page.getByRole("button", { name: "Бойцы", exact: true }).click();
    const summary = page.getByRole("status", { name: "Количество записей" });
    await expect(summary).toHaveText("Показано: 3");
    const response = page.waitForResponse(res => res.url().includes("group=COACHES"));
    await pending!.fulfill({ json: members(1) });
    await (await response).finished();
    // Give React a render cycle to apply any stale state update.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(summary).toHaveText("Показано: 3");
    await expect(page.getByRole("button", { name: /^Открыть карточку / })).toHaveCount(3);
});
