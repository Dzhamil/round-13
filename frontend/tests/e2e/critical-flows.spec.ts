import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { authAs } from "./support/auth";
import { installConsoleGuards } from "./support/consoleGuards";
import {
    QA_CLUB_EVENT,
    QA_MY_SCHEDULE,
    QA_ORDER_ID,
    QA_PANEL_ADMIN_PASSWORD,
    QA_REFERENCE_DATE,
    QA_SHOP_CATEGORY,
    QA_SHOP_PRODUCTS,
    QA_USERS,
} from "./support/apiFixtures";
import { installMockApi } from "./support/mockApi";
import { expectNoHorizontalOverflow, expectVisibleWithoutCenterCover } from "./support/layoutAssertions";

const QA_CLOCK_NOW = "2026-05-19T20:00:00+03:00";
const QA_PAST_REFERENCE_DATE = "2026-05-19";

function skipUnlessProject(testInfo: TestInfo, projectName: string): void {
    test.skip(testInfo.project.name !== projectName, `Runs in ${projectName}`);
}

async function freezeQaClock(page: Page): Promise<void> {
    await page.clock.setFixedTime(new Date(QA_CLOCK_NOW));
}

async function seedSelectedTimetableDate(page: Page) {
    await page.addInitScript((selectedDate) => {
        window.sessionStorage.setItem("round13:timetable:selected-date", selectedDate);
    }, QA_REFERENCE_DATE);
}

async function gotoApp(page: Page, path: string): Promise<void> {
    await page.goto(path);
    await page.waitForLoadState("domcontentloaded");

    const splash = page.locator('[data-startup-splash="overlay"]');
    await splash.waitFor({
        state: "attached",
        timeout: 2_000,
    }).catch(() => undefined);
    await splash.waitFor({
        state: "detached",
        timeout: 15_000,
    });
}

test.describe("critical bot regression flows", () => {
    test("P0: /profile/:id renders public profile without a client crash", async ({ page }, testInfo) => {
        skipUnlessProject(testInfo, "chromium-mobile");
        const guard = installConsoleGuards(page);
        await installMockApi(page, { role: "coach" });
        await authAs(page, "coach");

        await gotoApp(page, `/profile/${QA_USERS.athlete.id}`);

        await expect(page).toHaveURL(new RegExp(`/profile/${QA_USERS.athlete.id}$`));
        await expect(page.getByText(QA_USERS.athlete.fullName)).toBeVisible();
        await expect(page.getByRole("button", { name: /Подписаться|Отписаться/ })).toBeVisible();
        await guard.assertClean();
    });

    test("P0: admin empty and wrong login stay on the login page", async ({ page }, testInfo) => {
        skipUnlessProject(testInfo, "chromium-desktop-admin");
        const guard = installConsoleGuards(page);
        await installMockApi(page);

        await gotoApp(page, "/panel");
        await page.getByRole("button", { name: "Войти" }).click();

        await expect(page).toHaveURL(/\/panel$/);
        await expect(page.getByText("Заполни логин и пароль")).toBeVisible();
        await expect(page.getByRole("heading", { name: "Пользователи" })).toHaveCount(0);

        await page.getByLabel("Логин").fill("qa-admin");
        await page.getByLabel("Пароль").fill("wrong-password");
        await page.getByRole("button", { name: "Войти" }).click();

        await expect(page).toHaveURL(/\/panel$/);
        await expect(page.getByText("Неверный логин или пароль")).toBeVisible();
        await expect(page.getByRole("heading", { name: "Пользователи" })).toHaveCount(0);
        await guard.assertClean();
    });

    test("P0: admin valid login shows users and handles malformed users payload", async ({ page }, testInfo) => {
        skipUnlessProject(testInfo, "chromium-desktop-admin");
        const guard = installConsoleGuards(page);
        await installMockApi(page);

        await gotoApp(page, "/panel");
        await page.getByLabel("Логин").fill("qa-admin");
        await page.getByLabel("Пароль").fill(QA_PANEL_ADMIN_PASSWORD);
        await page.getByRole("button", { name: "Войти" }).click();

        await expect(page).toHaveURL(/\/admin\/users$/);
        await expect(page.getByText(QA_USERS.admin.nickname)).toBeVisible();
        await expect(page.getByText(QA_USERS.coach.nickname)).toBeVisible();
        await expect(page.getByText(QA_USERS.athlete.nickname)).toBeVisible();
        await guard.assertClean();

        await page.unroute("**/*");
        await installMockApi(page, { panelUsersMode: "malformed" });
        await gotoApp(page, "/admin/users");

        await expect(page).toHaveURL(/\/admin\/users$/);
        await expect(page.getByText("Некорректный ответ сервера админ-панели")).toBeVisible();
        await expect(page.getByText(/users\.map is not a function/i)).toHaveCount(0);
        await guard.assertClean();
    });

    test("P0: shop active mapping and category purchase path work", async ({ page }, testInfo) => {
        skipUnlessProject(testInfo, "chromium-mobile");
        const guard = installConsoleGuards(page);
        await installMockApi(page, { role: "athlete" });
        await authAs(page, "athlete");

        await gotoApp(page, "/shop");
        const products = await page.evaluate(async () => {
            const response = await fetch("/api/shop/products");
            return response.json();
        });

        for (const productCode of ["r13-tshirt-black", "group-8", "personal-ivan-4"]) {
            const product = products.find((item: { code: string }) => item.code === productCode);
            expect(product, `seeded product ${productCode}`).toBeTruthy();
            expect(product.isActive, `isActive for ${productCode}`).toBe(true);
        }

        await gotoApp(page, `/shop/category/${QA_SHOP_CATEGORY.id}`);
        await page.getByRole("button", { name: /Футболка Round13/ }).click();

        const orderResponse = page.waitForResponse((response) => (
            response.url().includes("/api/shop/orders")
            && response.request().method() === "POST"
        ));

        await page.getByRole("button", { name: "Купить товар" }).click();

        expect((await orderResponse).status()).toBe(201);
        await expect(page.getByText("Заявка отправлена администратору.")).toBeVisible();
        await expect(page.getByText(`Номер заявки: ${QA_ORDER_ID.slice(0, 8)}`)).toBeVisible();
        await guard.assertClean();
    });

    test("P0: direct shop product page exposes a real purchase entry point", async ({ page }, testInfo) => {
        skipUnlessProject(testInfo, "chromium-mobile");
        const guard = installConsoleGuards(page);
        await installMockApi(page, { role: "athlete" });
        await authAs(page, "athlete");

        await gotoApp(page, `/shop/${QA_SHOP_PRODUCTS[0].code}`);

        await expect(page.getByText("Футболка Round13")).toBeVisible();
        await expect(page.getByText("Купить (скоро)")).toHaveCount(0);
        await expect(page.getByRole("button", { name: /Купить товар|Оформить|Купить/ })).toBeVisible();
        await guard.assertClean();
    });

    test("P0: afisha mobile card keeps the real event title visible and tappable", async ({ page }, testInfo) => {
        skipUnlessProject(testInfo, "chromium-mobile");
        const guard = installConsoleGuards(page);
        await installMockApi(page, { role: "athlete" });
        await authAs(page, "athlete");

        await gotoApp(page, "/schedule");

        const title = page.getByText(QA_CLUB_EVENT.title, { exact: true });
        await expectVisibleWithoutCenterCover(title);
        await expect(page.getByRole("button", { name: new RegExp(QA_CLUB_EVENT.title) })).toBeVisible();
        await expectNoHorizontalOverflow(page);
        await guard.assertClean();
    });

    test("P0: schedule shows confirmed upcoming and attended history fixtures", async ({ page }, testInfo) => {
        skipUnlessProject(testInfo, "chromium-mobile");
        const guard = installConsoleGuards(page);
        await freezeQaClock(page);
        await installMockApi(page, { role: "athlete" });
        await authAs(page, "athlete");

        await gotoApp(page, "/schedule");

        const futureItems = await page.evaluate(async (referenceDate) => {
            const response = await fetch(`/api/account/schedule?from=${referenceDate}T00:00:00%2B03:00&to=2026-05-21T00:00:00%2B03:00`);
            return response.json();
        }, QA_REFERENCE_DATE);
        expect(futureItems.map((item: { title: string }) => item.title)).toEqual(expect.arrayContaining([
            "Персональная техника",
            "Групповая выносливость",
            "Персональная отмена ожидает подтверждения",
        ]));
        expect(futureItems.find((item: { title: string }) => item.title === "Персональная техника")?.status).toBe("BOOKED");

        await page.getByRole("button", { name: "Мои события" }).click();
        await expect(page.getByText("Персональная техника", { exact: true })).toBeVisible();
        await expect(page.getByText("Групповая выносливость", { exact: true })).toBeVisible();
        await expect(page.getByText("Записан").first()).toBeVisible();
        await expect(page.getByText("Ожидает подтверждения отмены")).toBeVisible();

        const pastItems = await page.evaluate(async (pastDate) => {
            const response = await fetch(`/api/account/schedule?from=${pastDate}T00:00:00%2B03:00&to=2026-05-20T00:00:00%2B03:00`);
            return response.json();
        }, QA_PAST_REFERENCE_DATE);
        expect(pastItems.map((item: { title: string }) => item.title)).toEqual(expect.arrayContaining([
            "Персональная работа на лапах",
            "Групповая техника защиты",
        ]));
        expect(pastItems.find((item: { title: string }) => item.title === "Персональная работа на лапах")?.status).toBe("ATTENDED");

        await page.getByRole("button", { name: "История" }).click();
        await expect(page.getByText("Персональная работа на лапах", { exact: true })).toBeVisible();
        await expect(page.getByText("Групповая техника защиты", { exact: true })).toBeVisible();
        await expect(page.getByText("Тренировка посещена").first()).toBeVisible();
        await expect(page.getByText("Персональная неявка QA", { exact: true })).toBeVisible();
        await expect(page.getByText("Неявка", { exact: true })).toBeVisible();
        await expectNoHorizontalOverflow(page);
        await guard.assertClean();
    });

    test("P0: timetable reveals exact training title or opens exact details", async ({ page }, testInfo) => {
        skipUnlessProject(testInfo, "chromium-mobile");
        const guard = installConsoleGuards(page);
        await freezeQaClock(page);
        await installMockApi(page, { role: "athlete" });
        await authAs(page, "athlete");
        await seedSelectedTimetableDate(page);

        await gotoApp(page, `/timetable/day/${QA_REFERENCE_DATE}`);

        await expect(page.getByText(QA_MY_SCHEDULE[0].title, { exact: true })).toBeVisible();
        await expect(page.getByText(QA_MY_SCHEDULE[1].title, { exact: true })).toBeVisible();
        await page.getByRole("button", { name: /Персональная техника/ }).first().click();
        await expect(page.getByText(`Статус: Записан`)).toBeVisible();
        await page.getByRole("button", { name: "Закрыть" }).click();

        await gotoApp(page, `/timetable/day/${QA_PAST_REFERENCE_DATE}`);

        await expect(page.getByText("Персональная работа на лапах", { exact: true })).toBeVisible();
        await expect(page.getByText("Групповая техника защиты", { exact: true })).toBeVisible();
        await page.getByRole("button", { name: /Персональная работа на лапах/ }).first().click();
        await expect(page.getByText("Статус: Тренировка посещена")).toBeVisible();
        await expectNoHorizontalOverflow(page);
        await guard.assertClean();
    });
});
