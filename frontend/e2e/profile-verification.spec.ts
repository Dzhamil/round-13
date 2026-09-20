import { expect, test, type Page } from "@playwright/test";
import { completedProfileIdentityFixture } from "../tests/fixtures/profileIdentity";

async function setup(page: Page, required = true, keepIncomplete = false) {
    let me = {
        id: "profile-verification", role: "COACH", status: "ACTIVE", nickname: "club_nickname",
        phone: "+79991234567", phoneHidden: true, gender: "MALE", birthDate: "2000-01-01",
        avatarUrl: "/images/profile-tabs/profile-tab-stats.png", fullName: "Legacy display name",
        surname: required ? "" : completedProfileIdentityFixture.surname,
        firstName: completedProfileIdentityFixture.firstName, patronymic: completedProfileIdentityFixture.patronymic,
        profileCompleted: !required, profileVerificationRequired: required,
        profileMissingFields: required ? ["surname"] : [],
    };
    await page.addInitScript(() => {
        localStorage.setItem("accessToken", "verification-test");
        localStorage.setItem("refreshToken", "verification-refresh");
    });
    await page.route("**/api/**", async route => {
        const path = new URL(route.request().url()).pathname;
        if (path === "/api/account/complete-profile") {
            const body = route.request().postDataJSON();
            expect(body.nickname).toBe("club_nickname");
            expect(body.phoneHidden).toBe(true);
            me = { ...me, ...body, profileCompleted: !keepIncomplete,
                profileVerificationRequired: keepIncomplete, profileMissingFields: keepIncomplete ? ["birthDate"] : [] };
        }
        await route.fulfill({ json: path.startsWith("/api/account/") ? me : { items: [] } });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
}

test("incomplete active profile shows yellow CTA alongside schedule, saves and hides it without reload", async ({ page }) => {
    await setup(page);
    const cta = page.getByRole("link", { name: "Пройти верификацию" });
    await expect(cta).toBeVisible();
    await expect(page.getByRole("link", { name: "Расписание 2.0", exact: true })).toBeVisible();
    expect(await cta.evaluate(el => getComputedStyle(el).backgroundImage)).toContain("253, 224, 71");
    const ctaBox = await cta.boundingBox();
    const scheduleBox = await page.getByRole("link", { name: "Расписание 2.0", exact: true }).boundingBox();
    expect(ctaBox!.y).toBe(scheduleBox!.y);
    await page.screenshot({ path: test.info().outputPath("verification-main-menu.png") });
    await cta.click();
    await expect(page).toHaveURL(/\/profile\/complete\?verification=1/);
    await expect(page.getByRole("status")).toContainText("Фамилия");
    await expect(page.getByLabel("Имя", { exact: true })).toHaveValue(completedProfileIdentityFixture.firstName);
    await expect(page.getByLabel("Фамилия", { exact: true })).toHaveValue("");
    await page.getByLabel("Фамилия", { exact: true }).fill(completedProfileIdentityFixture.surname);
    await page.getByRole("button", { name: "Сохранить профиль" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(cta).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Расписание 2.0", exact: true })).toBeVisible();
});

test("completed backend profile hides CTA", async ({ page }) => {
    await setup(page, false);
    await expect(page.getByRole("link", { name: "Расписание 2.0", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Пройти верификацию" })).toHaveCount(0);
});

test("missing surname blocks save and backend incomplete response keeps verification available", async ({ page }) => {
    await setup(page, true, true);
    await page.getByRole("link", { name: "Пройти верификацию" }).click();
    await page.getByRole("button", { name: "Сохранить профиль" }).click();
    await expect(page.getByText("Заполните фамилию, имя и отчество.", { exact: true })).toBeVisible();
    await page.getByLabel("Фамилия", { exact: true }).fill(completedProfileIdentityFixture.surname);
    await page.getByRole("button", { name: "Сохранить профиль" }).click();
    await expect(page.getByRole("status")).toContainText("Дата рождения");
    await page.getByRole("link", { name: "В главное меню" }).click();
    await expect(page.getByRole("link", { name: "Пройти верификацию" })).toBeVisible();
});
