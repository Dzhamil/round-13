import type { Page, Route } from "@playwright/test";
import {
    meResponse,
    QA_CLUB_EVENT,
    QA_MY_SCHEDULE,
    QA_LOYALTY_HISTORY,
    QA_LOYALTY_SUMMARY,
    QA_MEMBER_DETAILS,
    QA_MEMBER_ITEMS,
    QA_ORDER_ID,
    QA_ERROR_JOURNAL_EVENT,
    QA_PANEL_ADMIN_PASSWORD,
    QA_PANEL_USERS,
    QA_SHOP_CATEGORY,
    QA_SHOP_PRODUCTS,
    QA_USERS,
    type QaRole,
} from "./apiFixtures";

type PanelUsersMode = "valid" | "malformed";

type InstallMockApiOptions = {
    role?: QaRole;
    panelUsersMode?: PanelUsersMode;
};

function pathWithoutApiPrefix(requestUrl: string): string {
    const url = new URL(requestUrl);
    return url.pathname.replace(/^\/api/, "") || "/";
}

async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
    await route.fulfill({
        status,
        contentType: "application/json",
        headers: {
            "Cache-Control": "no-store",
        },
        body: JSON.stringify(body),
    });
}

function timeOrNull(value: string | null): number | null {
    if (!value) {
        return null;
    }

    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? null : parsed;
}

function filterScheduleByRange(url: URL): Array<(typeof QA_MY_SCHEDULE)[number]> {
    const from = timeOrNull(url.searchParams.get("from"));
    const to = timeOrNull(url.searchParams.get("to"));

    return QA_MY_SCHEDULE.filter((item) => {
        const startsAt = timeOrNull(item.startsAt);
        if (startsAt === null) {
            return false;
        }

        if (from !== null && startsAt < from) {
            return false;
        }

        if (to !== null && startsAt >= to) {
            return false;
        }

        return true;
    });
}

async function handlePanelLogin(route: Route): Promise<void> {
    const form = new URLSearchParams(route.request().postData() ?? "");
    const login = form.get("login");
    const password = form.get("password");

    if (login === "qa-admin" && password === QA_PANEL_ADMIN_PASSWORD) {
        await fulfillJson(route, 200, { ok: true });
        return;
    }

    await fulfillJson(route, 401, { message: "Неверный логин или пароль" });
}

function productByCode(code: string) {
    return QA_SHOP_PRODUCTS.find((product) => product.code === code);
}

async function handleApiRoute(route: Route, options: Required<InstallMockApiOptions>): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const path = pathWithoutApiPrefix(request.url());
    const method = request.method();

    if (method === "GET" && path === "/account/me") {
        await fulfillJson(route, 200, meResponse(options.role));
        return;
    }

    if (method === "GET" && path === "/stats/me") {
        await fulfillJson(route, 200, {
            trainingsVisited: 42,
            trainingsMissed: 3,
            sparringsTotal: 4,
            wins: 3,
            defeats: 1,
            ratingPlace: 3,
            winRatePercent: 75,
        });
        return;
    }

    if (method === "GET" && path === "/account/loyalty/summary") {
        await fulfillJson(route, 200, QA_LOYALTY_SUMMARY);
        return;
    }

    if (method === "GET" && path === "/account/loyalty/history") {
        await fulfillJson(route, 200, QA_LOYALTY_HISTORY);
        return;
    }

    if (method === "GET" && path === "/loyalty/leaderboard") {
        await fulfillJson(route, 200, {
            items: [
                {
                    place: 1,
                    memberId: QA_USERS.athlete.id,
                    nickname: QA_USERS.athlete.nickname,
                    totalPoints: QA_LOYALTY_SUMMARY.totalPoints,
                    rank: QA_LOYALTY_SUMMARY.currentRank,
                },
            ],
        });
        return;
    }

    if (method === "GET" && path === "/members") {
        const group = url.searchParams.get("group");
        await fulfillJson(route, 200, {
            items: group === "COACHES"
                ? QA_MEMBER_ITEMS.filter((item) => item.roleCode === "COACH")
                : QA_MEMBER_ITEMS.filter((item) => item.roleCode !== "COACH"),
        });
        return;
    }

    if (method === "GET" && path === "/members/my-students") {
        await fulfillJson(route, 200, {
            items: QA_MEMBER_ITEMS.filter((item) => item.roleCode !== "COACH"),
        });
        return;
    }

    if (method === "GET" && path === "/admin/trainer-student-links") {
        await fulfillJson(route, 200, {
            items: QA_MEMBER_ITEMS.filter((item) => item.roleCode !== "COACH"),
        });
        return;
    }

    if (method === "GET" && path === `/members/${QA_USERS.athlete.id}`) {
        await fulfillJson(route, 200, QA_MEMBER_DETAILS);
        return;
    }

    if (method === "GET" && (
        path === `/admin/loyalty/members/${QA_USERS.athlete.id}/history` ||
        path === `/trainer/students/${QA_USERS.athlete.id}/loyalty/history`
    )) {
        await fulfillJson(route, 200, QA_LOYALTY_HISTORY);
        return;
    }

    if (method === "POST" && (
        path === "/admin/loyalty/points/manual" ||
        path === `/trainer/students/${QA_USERS.athlete.id}/loyalty/points/manual`
    )) {
        await fulfillJson(route, 200, {
            ...QA_LOYALTY_HISTORY[0],
            id: "90000000-0000-0000-0000-000000000003",
            reason: "QA начисление",
        });
        return;
    }

    if (method === "POST" && path.includes("/admin/loyalty/points/") && path.endsWith("/corrections")) {
        await fulfillJson(route, 200, {
            ...QA_LOYALTY_HISTORY[0],
            id: "90000000-0000-0000-0000-000000000004",
            sourceType: "CORRECTION",
            pointsDelta: 1,
            reason: "QA коррекция",
            correctionOfEntryId: QA_LOYALTY_HISTORY[0].id,
        });
        return;
    }

    if (method === "POST" && path.includes("/admin/loyalty/points/") && path.endsWith("/revoke")) {
        await fulfillJson(route, 200, {
            ...QA_LOYALTY_HISTORY[0],
            id: "90000000-0000-0000-0000-000000000005",
            sourceType: "REVERSAL",
            pointsDelta: -2,
            reason: "QA отзыв",
            revokedEntryId: QA_LOYALTY_HISTORY[0].id,
        });
        return;
    }

    if (method === "GET" && path === `/users/${QA_USERS.athlete.id}`) {
        await fulfillJson(route, 200, {
            id: QA_USERS.athlete.id,
            nickname: QA_USERS.athlete.nickname,
            fullName: QA_USERS.athlete.fullName,
            avatarUrl: QA_USERS.athlete.avatarUrl,
            gender: "FEMALE",
            ratingPlace: 3,
            winRatePercent: 72,
        });
        return;
    }

    if (method === "POST" && path === "/panel/auth/login") {
        await handlePanelLogin(route);
        return;
    }

    if (method === "GET" && path === "/panel/auth/me") {
        await fulfillJson(route, 200, { id: "qa-panel-session", login: "qa-admin" });
        return;
    }

    if (method === "GET" && path === "/panel/users") {
        if (options.panelUsersMode === "malformed") {
            await fulfillJson(route, 200, { users: QA_PANEL_USERS });
            return;
        }

        await fulfillJson(route, 200, QA_PANEL_USERS);
        return;
    }

    if (method === "GET" && path === "/panel/error-journal") {
        await fulfillJson(route, 200, {
            items: [QA_ERROR_JOURNAL_EVENT],
            page: Number(url.searchParams.get("page") ?? 0),
            size: Number(url.searchParams.get("size") ?? 25),
            totalItems: 1,
            totalPages: 1,
        });
        return;
    }

    if (method === "GET" && path === `/panel/error-journal/${QA_ERROR_JOURNAL_EVENT.id}`) {
        await fulfillJson(route, 200, QA_ERROR_JOURNAL_EVENT);
        return;
    }

    if (method === "PATCH" && path === `/panel/error-journal/${QA_ERROR_JOURNAL_EVENT.id}/status`) {
        const payload = JSON.parse(request.postData() || "{}") as { status?: string; note?: string };
        await fulfillJson(route, 200, {
            ...QA_ERROR_JOURNAL_EVENT,
            status: payload.status ?? "RESOLVED",
            resolutionNote: payload.note ?? null,
            resolvedAt: "2026-07-02T10:00:00Z",
            resolvedByUserId: "00000000-0000-0000-0000-000000000001",
        });
        return;
    }

    if (method === "GET" && path === "/shop/categories") {
        await fulfillJson(route, 200, [QA_SHOP_CATEGORY]);
        return;
    }

    if (method === "GET" && path === "/shop/products") {
        await fulfillJson(route, 200, QA_SHOP_PRODUCTS);
        return;
    }

    if (method === "GET" && path === `/shop/categories/${QA_SHOP_CATEGORY.id}/products`) {
        await fulfillJson(route, 200, QA_SHOP_PRODUCTS);
        return;
    }

    if (method === "GET" && path.startsWith("/shop/products/code/")) {
        const code = decodeURIComponent(path.split("/").at(-1) ?? "");
        const product = productByCode(code);
        await fulfillJson(route, product ? 200 : 404, product ?? { message: "Товар не найден" });
        return;
    }

    if (method === "POST" && path === "/shop/orders") {
        await fulfillJson(route, 201, QA_ORDER_ID);
        return;
    }

    if (method === "GET" && path === "/shop/orders") {
        await fulfillJson(route, 200, []);
        return;
    }

    if (method === "GET" && path === "/events") {
        await fulfillJson(route, 200, [QA_CLUB_EVENT]);
        return;
    }

    if (method === "GET" && (path === "/events/history" || path === "/account/events")) {
        await fulfillJson(route, 200, []);
        return;
    }

    if (method === "GET" && path === "/account/schedule") {
        await fulfillJson(route, 200, filterScheduleByRange(url));
        return;
    }

    if (method === "GET" && path === "/trainer/schedule") {
        await fulfillJson(route, 200, []);
        return;
    }

    await fulfillJson(route, 404, {
        message: `No QA mock for ${method} ${url.pathname}`,
    });
}

export async function installMockApi(
    page: Page,
    options: InstallMockApiOptions = {},
): Promise<void> {
    const resolvedOptions: Required<InstallMockApiOptions> = {
        role: options.role ?? "athlete",
        panelUsersMode: options.panelUsersMode ?? "valid",
    };

    await page.route("**/*", (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path !== "/api" && !path.startsWith("/api/")) {
            return route.fallback();
        }

        return handleApiRoute(route, resolvedOptions);
    });
}
