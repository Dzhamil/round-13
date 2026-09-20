import { expect, test, type Page } from "@playwright/test";
import { installMockApi } from "../tests/e2e/support/mockApi";

async function openSettings(page: Page, active = true) {
    await page.addInitScript(() => localStorage.setItem("panelAccessToken", "qa-panel"));
    await installMockApi(page);
    await page.route("**/api/panel/google-sheet-spaces", route => route.fulfill({ json: [{
        id: "space-1", displayName: "Schedule 2.0", spreadsheetId: "test-sheet", active,
        credentialsAvailable: true,
    }] }));
    await page.route("**/api/panel/google-sheet-spaces/active/sync-participants", route =>
        route.fulfill({ json: { activeParticipants: 5 } }));
    await page.goto("/admin/google-sheets");
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    await expect(page.locator('[data-startup-splash="overlay"]')).toHaveCount(0);
}

test("manual trainer sync reports counts, prevents double click and supports retry", async ({ page }) => {
    let calls = 0;
    let release: () => void = () => {};
    const pending = new Promise<void>(resolve => { release = resolve; });
    await openSettings(page);
    await page.route("**/api/panel/google-sheet-spaces/active/sync-trainers", async route => {
        expect(route.request().method()).toBe("POST");
        calls++;
        if (calls === 1) await pending;
        await route.fulfill({ json: { spreadsheetId: "test-sheet", activeTrainers: 2,
            inactiveRows: 3, addedRows: calls === 1 ? 2 : 0, unmatchedRows: 1, duplicateRows: 0 } });
    });
    const button = page.getByRole("button", { name: "Синхронизировать таблицу", exact: true });
    expect(calls).toBe(0);
    await button.click();
    await expect(page.getByRole("button", { name: "Синхронизация…", exact: true })).toBeDisabled();
    release();
    await expect(page.getByRole("status").filter({ hasText: "Активных тренеров" })).toContainText("Активных тренеров: 2");
    await expect(page.getByRole("status").filter({ hasText: "Активных тренеров" })).toContainText("Добавлено строк: 2");
    await expect(page.getByRole("link", { name: "Открыть таблицу" })).toHaveAttribute("href", "https://docs.google.com/spreadsheets/d/test-sheet/edit");
    await button.click();
    await expect(page.getByRole("status").filter({ hasText: "Активных тренеров" })).toContainText("Добавлено строк: 0");
    expect(calls).toBe(2);
});

test("sync failure is visible and button can retry", async ({ page }) => {
    await openSettings(page);
    await page.route("**/api/panel/google-sheet-spaces/active/sync-trainers", route =>
        route.fulfill({ status: 503, json: { message: "Нет доступа к Google Sheets" } }));
    const button = page.getByRole("button", { name: "Синхронизировать таблицу", exact: true });
    await button.click();
    await expect(page.getByRole("alert")).toContainText("Нет доступа к Google Sheets");
    await expect(button).toBeEnabled();
    await expect(page.getByRole("status")).toHaveCount(0);
});

test("sync requires an active space", async ({ page }) => {
    await openSettings(page, false);
    await expect(page.getByRole("button", { name: "Синхронизировать таблицу", exact: true })).toBeDisabled();
    await expect(page.getByText("Настройте и активируйте Google Sheet-пространство.")).toBeVisible();
});

test("participant failure preserves trainer result and allows retry", async ({ page }) => {
    await openSettings(page);
    await page.route("**/api/panel/google-sheet-spaces/active/sync-trainers", route => route.fulfill({ json: {
        spreadsheetId: "test-sheet", activeTrainers: 2, inactiveRows: 0, addedRows: 0, unmatchedRows: 0, duplicateRows: 0,
    } }));
    await page.route("**/api/panel/google-sheet-spaces/active/sync-participants", route =>
        route.fulfill({ status: 503, json: { message: "Участники: нет доступа" } }));
    await page.getByRole("button", { name: "Синхронизировать таблицу", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Активных тренеров: 2");
    await expect(page.getByRole("alert")).toContainText("Участники: нет доступа");
    await expect(page.getByRole("button", { name: "Синхронизировать таблицу", exact: true })).toBeEnabled();
});

test("all users export is explicit, pending-safe, repeatable and reports errors", async ({ page }) => {
    await openSettings(page);
    let calls = 0;
    let release: () => void = () => {};
    const pending = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/api/panel/google-sheet-spaces/active/sync-users", async route => {
        calls++;
        if (calls === 1) await pending;
        if (calls === 3) return route.fulfill({ status: 503, json: { message: "Нет доступа" } });
        return route.fulfill({ json: { spreadsheetId: "test-sheet", sourceUsers: 42, syncedAt: "now" } });
    });
    const button = page.getByRole("button", { name: "Синхронизировать всех пользователей" });
    expect(calls).toBe(0);
    await button.click();
    await expect(page.getByRole("button", { name: "Выгрузка пользователей…" })).toBeDisabled();
    release();
    await expect(page.getByRole("status")).toContainText("Все пользователи синхронизированы: 42");
    await expect(page.getByRole("link", { name: "Открыть вкладку пользователей" })).toHaveAttribute("href", "https://docs.google.com/spreadsheets/d/test-sheet/edit");
    await button.click();
    await expect(page.getByRole("status")).toContainText("42");
    await button.click();
    await expect(page.getByRole("alert")).toContainText("Нет доступа");
    await expect(button).toBeEnabled();
});

test("all users export requires active space", async ({ page }) => {
    await openSettings(page, false);
    await expect(page.getByRole("button", { name: "Синхронизировать всех пользователей" })).toBeDisabled();
});
