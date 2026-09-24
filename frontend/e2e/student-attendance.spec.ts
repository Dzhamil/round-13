import { expect, test } from "@playwright/test";
import { authAs } from "../tests/e2e/support/auth";
import { installMockApi } from "../tests/e2e/support/mockApi";

// The member card and its history consume the same Schedule 2.0 attendance contract.
test("student card and history show PRESENT and ABSENT from attendanceStatus", async ({ page }) => {
    await authAs(page, "coach");
    await installMockApi(page, { role: "coach" });
    const member = { id: "student", nickname: "Ученик посещаемости", roleCode: "ATHLETE",
        phone: null, phoneHidden: true, avatarUrl: null, points: 0, statusLabel: "—", remainingTrainings: 3 };
    const trainings = [
        { id: "present", title: "Посещённая тренировка", startTime: "2026-09-20T12:00:00Z",
            durationMinutes: 60, location: null, attendanceStatus: "PRESENT" },
        { id: "absent", title: "Тренировка без отметки", startTime: "2026-09-21T12:00:00Z",
            durationMinutes: 60, location: null, attendanceStatus: "ABSENT" },
    ];
    await page.route("**/api/members?*", route => route.fulfill({ json: { items: [member] } }));
    await page.route("**/api/members/student", route => route.fulfill({ json: {
        ...member, myStudent: true, tenureMonths: 0, fightsCount: 0, winsCount: 0, defeatsCount: 0,
        knockoutsCount: 0, knockdownsCount: 0, trainingsAttendedCount: 1, aboutMe: null,
        trainerStudentCard: { operationalStatus: { code: "ACTIVE", lastAttendedAt: trainings[0].startTime },
            trainerNote: null, nextTraining: null, recentTrainings: trainings, recentBalanceChanges: [] },
    } }));
    await page.route("**/api/trainer/students/student/history", route => route.fulfill({ json: {
        trainings, balanceChanges: [],
    } }));
    await page.goto("/members");
    await page.getByRole("button", { name: "Пропустить заставку" }).click();
    await page.getByRole("button", { name: `Открыть карточку ${member.nickname}`, exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/Последнее подтвержденное посещение: 20 сент/)).toBeVisible();
    await dialog.getByRole("button", { name: "История", exact: true }).click();
    await expect(dialog.getByText("Посетил", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Посещение не отмечено", { exact: true })).toBeVisible();
});
