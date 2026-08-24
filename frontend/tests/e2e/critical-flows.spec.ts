import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { authAs } from "./support/auth";
import { installConsoleGuards } from "./support/consoleGuards";
import {
    QA_CLUB_EVENT,
    QA_MY_SCHEDULE,
    QA_ORDER_ID,
    QA_ERROR_JOURNAL_EVENT,
    QA_PANEL_ADMIN_PASSWORD,
    QA_PUBLIC_PROFILE,
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
    const skipSplash = page.getByRole("button", { name: "Пропустить заставку" });

    await skipSplash.waitFor({
        state: "visible",
        timeout: 5_000,
    }).catch(() => undefined);
    if (await skipSplash.isVisible().catch(() => false)) {
        await skipSplash.click();
    }

    await splash.waitFor({
        state: "detached",
        timeout: 5_000,
    });
}

test.describe("critical bot regression flows", () => {
    test("P0: self profile shows boxer potential progress scales", async ({ page }, testInfo) => {
        skipUnlessProject(testInfo, "chromium-mobile");
        const guard = installConsoleGuards(page);
        await installMockApi(page, { role: "athlete" });
        await authAs(page, "athlete");

        await gotoApp(page, "/profile");

        const compactHeader = page.getByTestId("profile-compact-header");
        const compactAvatar = page.getByTestId("profile-compact-avatar");
        const compactInfo = page.getByTestId("profile-compact-info");
        await expect(compactHeader).toBeVisible();
        await expect(compactAvatar).toBeVisible();
        await expect(compactInfo).toBeVisible();
        await expect(compactInfo.getByText(QA_USERS.athlete.fullName)).toBeVisible();
        for (const profileText of [
            "Пол",
            "Женский",
            "Ник",
            QA_USERS.athlete.nickname,
            "Телефон",
            "+7 (999) 000-00-03",
            "Видимость",
            "Виден",
            "Дата рождения",
            "01.01.1995",
        ]) {
            await expect(compactInfo.getByText(profileText, { exact: true })).toBeVisible();
        }
        await expect(compactInfo.getByText("Виден другим участникам", { exact: true })).toHaveCount(0);
        await expect(compactInfo.getByText("1995-01-01", { exact: true })).toHaveCount(0);

        const compactPolish = await page.evaluate(() => {
            const avatar = document.querySelector('[data-testid="profile-compact-avatar"]');
            const value = Array.from(document.querySelectorAll('[data-testid="profile-compact-info"] span'))
                .find((element) => element.textContent === "Женский");
            const settingsButton = Array.from(document.querySelectorAll("button"))
                .find((element) => element.textContent === "Настройки");

            if (!avatar || !value || !settingsButton) {
                return null;
            }

            const avatarRect = avatar.getBoundingClientRect();
            const avatarStyle = window.getComputedStyle(avatar);
            const valueStyle = window.getComputedStyle(value);
            const buttonColorProbe = document.createElement("span");
            buttonColorProbe.style.color = "var(--tg-theme-button-color, #62b0ff)";
            document.body.appendChild(buttonColorProbe);
            const buttonColor = window.getComputedStyle(buttonColorProbe).color;
            buttonColorProbe.remove();
            const settingsRect = settingsButton.getBoundingClientRect();

            return {
                avatarWidth: avatarRect.width,
                avatarHeight: avatarRect.height,
                avatarRadius: avatarStyle.borderRadius,
                valueColor: valueStyle.color,
                buttonColor,
                settingsHeight: settingsRect.height,
            };
        });

        expect(compactPolish).not.toBeNull();
        expect(compactPolish?.avatarWidth).toBe(compactPolish?.avatarHeight);
        expect(compactPolish?.avatarRadius).not.toBe("50%");
        expect(compactPolish?.valueColor).not.toBe(compactPolish?.buttonColor);
        expect(compactPolish?.settingsHeight ?? 999).toBeLessThanOrEqual(34);
        await expect(page.getByText("О себе", { exact: true })).toBeVisible();
        await expect(page.getByText("Локальный QA профиль")).toBeVisible();

        const compactLayout = await page.evaluate(() => {
            const avatar = document.querySelector('[data-testid="profile-compact-avatar"]')?.getBoundingClientRect();
            const info = document.querySelector('[data-testid="profile-compact-info"]')?.getBoundingClientRect();
            const about = Array.from(document.querySelectorAll("div"))
                .find((element) => element.textContent === "Локальный QA профиль")
                ?.getBoundingClientRect();

            if (!avatar || !info || !about) {
                return null;
            }

            return {
                avatarLeft: avatar.left,
                avatarRight: avatar.right,
                infoLeft: info.left,
                infoTop: info.top,
                aboutTop: about.top,
                headerBottom: Math.max(avatar.bottom, info.bottom),
            };
        });

        expect(compactLayout).not.toBeNull();
        expect(compactLayout?.avatarLeft ?? 1).toBeLessThan(compactLayout?.infoLeft ?? 0);
        expect(compactLayout?.avatarRight ?? 0).toBeLessThanOrEqual((compactLayout?.infoLeft ?? 0) + 1);
        expect(compactLayout?.infoTop ?? 999).toBeLessThan((compactLayout?.aboutTop ?? 0));
        expect(compactLayout?.headerBottom ?? 999).toBeLessThan((compactLayout?.aboutTop ?? 0));

        const potentialBlock = page.getByTestId("profile-boxer-potential");
        await expect(potentialBlock).toBeVisible();
        await expect(potentialBlock.getByText("Потенциал боксера")).toBeVisible();
        for (const label of ["Сила", "Выносливость", "Скорость", "Ловкость"]) {
            await expect(potentialBlock.getByText(label)).toBeVisible();
        }
        await expect(potentialBlock.getByRole("button", { name: "+" })).toHaveCount(0);
        await expect(potentialBlock.getByTitle(/Открыть/)).toHaveCount(0);
        await expect(potentialBlock.getByText("43,8")).toBeVisible();
        await expect(potentialBlock.getByText("54")).toBeVisible();
        await expect(potentialBlock.getByText("77,5")).toBeVisible();
        await expect(potentialBlock.getByText("50,5")).toBeVisible();

        await gotoApp(page, "/profile/boxer-potential/strength");
        const characteristicScreen = page.getByTestId("profile-boxer-potential-characteristic");
        await expect(characteristicScreen).toBeVisible();
        await expect(characteristicScreen.getByRole("heading", { name: "Сила" })).toBeVisible();
        for (const testName of [
            "Отжимания за 1.5 минуты",
            "Подтягивания",
            "Взрывные прыжки за 1.5 минуты",
            "Динамометр / сила одного удара",
        ]) {
            await expect(characteristicScreen.getByText(testName)).toBeVisible();
        }

        await characteristicScreen.getByRole("button", { name: /Отжимания за 1\.5 минуты/ }).click();
        await expect(page).toHaveURL(/\/profile\/boxer-potential\/tests\/pushUps90Sec$/);
        const testScreen = page.getByTestId("profile-boxer-potential-test");
        await expect(testScreen).toBeVisible();
        await expect(testScreen.getByRole("heading", { name: "Отжимания за 1.5 минуты" })).toBeVisible();
        for (const periodLabel of ["неделя", "месяц", "год"]) {
            await expect(testScreen.getByRole("button", { name: periodLabel })).toBeVisible();
            await testScreen.getByRole("button", { name: periodLabel }).click();
        }
        await expect(testScreen.getByRole("img", { name: /График истории/ })).toBeVisible();
        await expect(testScreen.getByText("20.08.2026")).toBeVisible();
        await expect(testScreen.getByText("15.07.2026")).toBeVisible();
        await expect(testScreen.getByRole("button", { name: /Добавить|Сохранить|Редактировать/ })).toHaveCount(0);
        await expectNoHorizontalOverflow(page);
        await guard.assertClean();
    });

    test("P0: self profile hides duplicate nickname in compact info", async ({ page }, testInfo) => {
        skipUnlessProject(testInfo, "chromium-mobile");
        const guard = installConsoleGuards(page);
        await installMockApi(page, {
            role: "athlete",
            meOverrides: {
                fullName: QA_USERS.athlete.nickname,
            },
        });
        await authAs(page, "athlete");

        await gotoApp(page, "/profile");

        const compactInfo = page.getByTestId("profile-compact-info");
        await expect(compactInfo.getByText(QA_USERS.athlete.nickname, { exact: true })).toHaveCount(1);
        await expect(compactInfo.getByText("Ник", { exact: true })).toHaveCount(0);
        await expectNoHorizontalOverflow(page);
        await guard.assertClean();
    });

    test("P0: regular participant cannot see another participant's phone on public profile", async ({ page }, testInfo) => {
        skipUnlessProject(testInfo, "chromium-mobile");
        const guard = installConsoleGuards(page);
        await installMockApi(page, { role: "athlete" });
        await authAs(page, "athlete");

        expect(QA_USERS.athlete.id).not.toBe(QA_PUBLIC_PROFILE.id);
        await gotoApp(page, `/profile/${QA_PUBLIC_PROFILE.id}`);

        await expect(page).toHaveURL(new RegExp(`/profile/${QA_PUBLIC_PROFILE.id}$`));
        await expect(page.getByText(QA_PUBLIC_PROFILE.fullName)).toBeVisible();
        await expect(page.getByTestId("profile-compact-info").getByText("Женский", { exact: true })).toBeVisible();
        await expect(page.getByText(QA_PUBLIC_PROFILE.phone, { exact: false })).toHaveCount(0);
        await expect(page.getByText("+7 (999) 000-00-04", { exact: true })).toHaveCount(0);
        await expect(page.getByRole("button", { name: /Подписаться|Отписаться/ })).toBeVisible();
        await expectNoHorizontalOverflow(page);
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

    test("P0: admin error journal lists, opens detail, and updates status", async ({ page }) => {
        const guard = installConsoleGuards(page);
        await installMockApi(page);

        await gotoApp(page, "/panel");
        await page.getByLabel("Логин").fill("qa-admin");
        await page.getByLabel("Пароль").fill(QA_PANEL_ADMIN_PASSWORD);
        await page.getByRole("button", { name: "Войти" }).click();

        await page.getByRole("link", { name: "Ошибки" }).click();

        await expect(page).toHaveURL(/\/admin\/error-journal$/);
        await expect(page.getByRole("heading", { name: "Журнал ошибок" })).toBeVisible();
        await expect(page.getByText(QA_ERROR_JOURNAL_EVENT.requestPath)).toBeVisible();
        await expect(page.getByText(QA_ERROR_JOURNAL_EVENT.message)).toBeVisible();

        await page.getByRole("button", { name: /Leaderboard failed/ }).click();
        await expect(page.getByText(QA_ERROR_JOURNAL_EVENT.stackTrace)).toBeVisible();
        await page.locator("aside").getByRole("combobox").selectOption("RESOLVED");
        await page.locator("aside").getByRole("textbox").fill("fixed in QA");
        await page.getByRole("button", { name: "Сохранить статус" }).click();

        await expect(page.getByText("fixed in QA")).toBeVisible();
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

    test("P0: shop uses top-level trainings, merch, and requests pages", async ({ page }) => {
        const guard = installConsoleGuards(page);
        await installMockApi(page, { role: "athlete" });
        await authAs(page, "athlete");

        await gotoApp(page, "/shop");

        await expect(page.getByRole("button", { name: "Тренировки" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Мерч" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Заявки" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Каталог" })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Групповые" })).toBeVisible();
        await expect(page.getByText("Группа пн, ср, пт - 19:00")).toBeVisible();

        await page.getByRole("button", { name: "Персональные" }).click();
        await expect(page.getByText("Тариф - VIP")).toBeVisible();

        await page.getByRole("button", { name: "Мерч" }).click();
        await expect(page.getByText(QA_SHOP_CATEGORY.title)).toBeVisible();
        await expect(page.getByText("Тариф - VIP")).toHaveCount(0);

        await page.getByRole("button", { name: "Заявки" }).click();
        await expect(page.getByText("Мои заявки")).toBeVisible();
        await expectNoHorizontalOverflow(page);
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
