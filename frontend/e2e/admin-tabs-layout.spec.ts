import { expect, test, type Page } from "@playwright/test";
import { installMockApi } from "../tests/e2e/support/mockApi";
import { expectNoHorizontalOverflow } from "../tests/e2e/support/layoutAssertions";

async function geometry(page: Page) {
    return page.evaluate(() => {
        const selectors = ["h1", 'nav[aria-label="Разделы админ-панели"]', '[data-testid="panel-admin-content"]'];
        return selectors.map(selector => {
            const { x, y, width, height } = document.querySelector(selector)!.getBoundingClientRect();
            return { x, y, width, height };
        });
    });
}

for (const width of [320, 390, 768, 1280]) {
    test(`admin tabs keep their geometry at ${width}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 844 });
        await installMockApi(page);
        await page.route("**/panel/google-sheet-spaces**", async route => {
            const isTest = route.request().url().endsWith("/test");
            await route.fulfill({
                status: isTest ? 400 : 200,
                contentType: "application/json",
                body: JSON.stringify(isTest
                    ? { message: "Ошибка доступа: " + "очень-длинный-текст".repeat(80) }
                    : [{
                        id: "layout-space",
                        displayName: "Test space",
                        spreadsheetId: "long-id".repeat(80),
                        active: true,
                        credentialsAvailable: false,
                    }]),
            });
        });
        await page.goto("/admin/google-sheets");
        const skipSplash = page.getByRole("button", { name: "Пропустить заставку" });
        await skipSplash.waitFor({ state: "visible", timeout: 5_000 }).catch(() => undefined);
        if (await skipSplash.isVisible()) await skipSplash.click();
        await page.locator('[data-startup-splash="overlay"]').waitFor({ state: "detached" });
        await expect(page.getByRole("heading", { name: "Google Sheets · Schedule 2.0" })).toBeVisible();
        const initial = await geometry(page);
        const nav = page.getByRole("navigation", { name: "Разделы админ-панели" });
        await expect(nav.getByRole("link", { name: "Google Sheets" })).toHaveAttribute("aria-current", "page");

        await page.getByRole("button", { name: "Проверить чтение/запись" }).click();
        await expect(page.getByText(/^Ошибка доступа:/)).toBeVisible();
        expect(await geometry(page)).toEqual(initial);
        await page.getByTestId("panel-admin-content").evaluate(element => { element.scrollTop = 0; });
        await expectNoHorizontalOverflow(page);
        await page.screenshot({ path: testInfo.outputPath("google-sheets.png") });

        for (const [tab, heading] of [["Пользователи", "Пользователи"], ["Ошибки", "Журнал ошибок"], ["Google Sheets", "Google Sheets · Schedule 2.0"]]) {
            await nav.getByRole("link", { name: tab, exact: true }).click();
            await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
            await expect(nav.getByRole("link", { name: tab, exact: true })).toHaveAttribute("aria-current", "page");
            expect(await geometry(page)).toEqual(initial);
            await expectNoHorizontalOverflow(page);
            if (tab === "Пользователи") {
                await page.getByRole("button", { name: "+ Создать пользователя вручную" }).click();
                await expect(page.getByPlaceholder("Фамилия", { exact: true })).toBeVisible();
                expect(await geometry(page)).toEqual(initial);
            }
        }

        await page.route("**/panel/users", route => route.fulfill({
            contentType: "application/json", body: "[]",
        }));
        await nav.getByRole("link", { name: "Пользователи", exact: true }).click();
        await expect(page.getByText("Загрузка…")).toHaveCount(0);
        expect(await geometry(page)).toEqual(initial);

        await page.route("**/panel/google-sheet-spaces", route => route.fulfill({
            contentType: "application/json", body: "[]",
        }));
        await nav.getByRole("link", { name: "Google Sheets", exact: true }).click();
        await expect(page.getByRole("button", { name: "Проверить чтение/запись" })).toHaveCount(0);
        expect(await geometry(page)).toEqual(initial);
    });
}
