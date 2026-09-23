import { expect, test, type Page } from "@playwright/test";
import { authAs } from "../tests/e2e/support/auth";
import { installMockApi } from "../tests/e2e/support/mockApi";
import type { AttendanceSheetSyncStatus, TrainingDetail } from "../src/pages/schedule2/schedule2.api";

async function openTraining(page: Page, status: AttendanceSheetSyncStatus = "NEW") {
    const date = new Date().toISOString().slice(0, 10);
    const detail: TrainingDetail = {
        training: { id: "training-1", title: "Delivery training", type: "GROUP", startTime: `${date}T18:00:00+03:00`,
            endTime: `${date}T19:00:00+03:00`, timezone: "Europe/Moscow", location: null, trainerName: "Coach",
            participantsCount: 1, version: 1, attendanceSheetSyncStatus: status,
            attendanceSheetSyncAttemptedAt: null, attendanceSheetSyncedAt: null },
        participants: [{ participationId: "part-1", studentId: "student-1", studentName: "Test Student",
            attendanceStatus: "ABSENT", comment: null, version: 0 }],
    };
    await authAs(page, "coach");
    await installMockApi(page, { role: "coach", meOverrides: { trainer: true } });
    await page.route("**/api/verification/incoming", route => route.fulfill({ json: [] }));
    await page.route("**/api/schedule2/trainings?*", route => route.fulfill({ json: [detail.training] }));
    await page.route("**/api/schedule2/trainings/training-1", route => route.fulfill({ json: detail }));
    await page.goto("/schedule-2");
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    await expect(page.locator('[data-startup-splash="overlay"]')).toHaveCount(0);
    await page.getByRole("button", { name: /Delivery training/ }).click();
    return detail;
}

test("NEW is neutral and can confirm unchanged all-absent attendance", async ({ page }) => {
    const detail = await openTraining(page);
    const status = page.getByRole("status").filter({ hasText: "Ожидает отметки" });
    await expect(status).toBeVisible();
    await expect(status).toHaveCSS("color", "rgb(209, 213, 219)");
    await expect(page.getByRole("button", { name: "Отправить повторно" })).toHaveCount(0);
    await page.route("**/api/schedule2/trainings/training-1/attendance", async route => {
        expect(route.request().method()).toBe("PUT");
        expect(route.request().postDataJSON().participants[0].status).toBe("ABSENT");
        detail.training.attendanceSheetSyncStatus = "SYNCED";
        await route.fulfill({ json: detail });
    });
    await page.getByRole("button", { name: "Подтвердить посещаемость" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Передано в таблицу" })).toHaveCSS("color", "rgb(183, 247, 207)");
    await expect(page.getByText(/Оплатил|Оплата/)).toHaveCount(0);
});

test("failed delivery is yellow and retry uses only training ID then becomes green", async ({ page }) => {
    const detail = await openTraining(page);
    let saves = 0, retries = 0;
    await page.route("**/api/schedule2/trainings/training-1/attendance", async route => {
        saves++;
        detail.participants[0].attendanceStatus = "PRESENT";
        detail.participants[0].version++;
        detail.training.attendanceSheetSyncStatus = "NOT_SYNCED";
        await route.fulfill({ json: detail });
    });
    let finish: () => void = () => {};
    const pending = new Promise<void>(resolve => { finish = resolve; });
    await page.route("**/api/schedule2/trainings/training-1/attendance/sync-to-sheets", async route => {
        retries++;
        expect(route.request().method()).toBe("POST");
        expect(route.request().postData()).toBeNull();
        await pending;
        detail.training.attendanceSheetSyncStatus = "SYNCED";
        await route.fulfill({ json: detail });
    });
    await page.getByRole("button", { name: /Test Student/ }).click();
    await page.getByRole("button", { name: "Подтвердить посещаемость" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Сохранено в приложении" })).toHaveCSS("color", "rgb(255, 230, 166)");
    await expect(page.getByText("Не удалось сохранить посещаемость", { exact: false })).toHaveCount(0);
    // Unsaved edits are not sent by retry and must remain visible afterward.
    await page.getByRole("button", { name: /Test Student/ }).click();
    await page.getByRole("button", { name: "Отправить повторно" }).click();
    await expect(page.getByRole("button", { name: "Отправка…" })).toBeDisabled();
    finish();
    await expect(page.getByRole("status").filter({ hasText: "Передано в таблицу" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Test Student/ })).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("button", { name: "Отправить повторно" })).toHaveCount(0);
    expect(saves).toBe(1); expect(retries).toBe(1);
});

test("DB save error retains NEW and shows save error instead of delivery warning", async ({ page }) => {
    await openTraining(page);
    await page.route("**/api/schedule2/trainings/training-1/attendance", route => route.fulfill({ status: 500, json: { message: "DB failure" } }));
    await page.getByRole("button", { name: /Test Student/ }).click();
    await page.getByRole("button", { name: "Подтвердить посещаемость" }).click();
    await expect(page.getByRole("alert")).toContainText("Не удалось сохранить посещаемость");
    await expect(page.getByRole("status").filter({ hasText: "Ожидает отметки" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Отправить повторно" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Test Student/ })).toHaveAttribute("aria-pressed", "true");
});

test("retry failure preserves NOT_SYNCED and allows another retry", async ({ page }) => {
    const detail = await openTraining(page, "NOT_SYNCED");
    await page.route("**/api/schedule2/trainings/training-1/attendance/sync-to-sheets", route => route.fulfill({ json: detail }));
    await page.getByRole("button", { name: "Отправить повторно" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Сохранено в приложении" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Отправить повторно" })).toBeEnabled();
    await page.route("**/api/schedule2/trainings/training-1/attendance/sync-to-sheets", route => route.fulfill({ status: 503, json: {} }));
    await page.getByRole("button", { name: "Отправить повторно" }).click();
    await expect(page.getByRole("alert")).toContainText("Сохранённая посещаемость остаётся в приложении");
    await expect(page.getByRole("button", { name: "Отправить повторно" })).toBeEnabled();
});

test("already SYNCED renders green without a retry action", async ({ page }) => {
    await openTraining(page, "SYNCED");
    await expect(page.getByRole("status").filter({ hasText: "Передано в таблицу" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Отправить повторно" })).toHaveCount(0);
});
