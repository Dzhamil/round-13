import { expect, test, type Page, type Route } from "@playwright/test";

const initialTokens = {
    accessToken: "expired-access-token",
    refreshToken: "valid-refresh-token",
};

const renewedTokens = {
    accessToken: "renewed-access-token",
    refreshToken: "renewed-refresh-token",
};

type RouteState = {
    accountRequests: number;
    accountAuthorizationHeaders: Array<string | undefined>;
    renewedAccountRequests: number;
    refreshRequests: number;
    loginRequests: number;
};

function profileResponse() {
    return {
        id: "00000000-0000-0000-0000-000000000001",
        role: "ATHLETE",
        status: "ACTIVE",
        nickname: "Test",
        phone: "+79991234567",
        gender: "MALE",
        avatarUrl: "https://example.test/avatar.png",
        profileCompleted: true,
    };
}

async function seedTokens(page: Page): Promise<void> {
    await page.addInitScript((tokens) => {
        const marker = "auth-refresh-e2e-tokens-seeded";
        if (sessionStorage.getItem(marker)) {
            return;
        }

        sessionStorage.setItem(marker, "true");
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
    }, initialTokens);
}

async function installReducedMotion(page: Page): Promise<void> {
    await page.addInitScript(() => {
        const originalMatchMedia = window.matchMedia.bind(window);
        window.matchMedia = (query: string) => {
            if (query === "(prefers-reduced-motion: reduce)") {
                return {
                    addEventListener: () => undefined,
                    addListener: () => undefined,
                    dispatchEvent: () => false,
                    matches: true,
                    media: query,
                    onchange: null,
                    removeEventListener: () => undefined,
                    removeListener: () => undefined,
                };
            }

            return originalMatchMedia(query);
        };
    });
}

async function expectStoredTokens(page: Page, tokens: typeof initialTokens | typeof renewedTokens | null): Promise<void> {
    await expect.poll(() =>
        page.evaluate(() => ({
            accessToken: localStorage.getItem("accessToken"),
            refreshToken: localStorage.getItem("refreshToken"),
        })),
    ).toEqual(tokens ?? { accessToken: null, refreshToken: null });
}

async function installApiRoutes(
    page: Page,
    state: RouteState,
    options: {
        refreshSucceeds: boolean;
        loginReturnsUnauthorized?: boolean;
    },
): Promise<void> {
    await page.route("**/api/**", async (route: Route) => {
        const request = route.request();
        const pathname = new URL(request.url()).pathname;

        if (pathname === "/api/account/me") {
            state.accountRequests += 1;
            const authorization = request.headers().authorization;
            state.accountAuthorizationHeaders.push(authorization);
            if (authorization !== `Bearer ${renewedTokens.accessToken}`) {
                await route.fulfill({ status: 401, contentType: "application/json", body: "{}" });
                return;
            }

            state.renewedAccountRequests += 1;
            await route.fulfill({ json: profileResponse() });
            return;
        }

        if (pathname === "/api/auth/refresh") {
            state.refreshRequests += 1;
            expect(request.postDataJSON()).toEqual({ refreshToken: initialTokens.refreshToken });

            if (!options.refreshSucceeds) {
                await route.fulfill({ status: 401, contentType: "application/json", body: "{}" });
                return;
            }

            await route.fulfill({ json: renewedTokens });
            return;
        }

        if (pathname === "/api/auth/login") {
            state.loginRequests += 1;
            if (options.loginReturnsUnauthorized) {
                await route.fulfill({ status: 401, contentType: "application/json", body: "{}" });
                return;
            }

            await route.fulfill({ json: renewedTokens });
            return;
        }

        await route.fulfill({ json: [] });
    });
}

function createRouteState(): RouteState {
    return {
        accountRequests: 0,
        accountAuthorizationHeaders: [],
        renewedAccountRequests: 0,
        refreshRequests: 0,
        loginRequests: 0,
    };
}

test("refreshes tokens and retries the protected request once after 401", async ({ page }) => {
    await seedTokens(page);
    await installReducedMotion(page);
    const state = createRouteState();
    await installApiRoutes(page, state, { refreshSucceeds: true });

    await page.goto("/rules");

    await expect.poll(() => state.renewedAccountRequests).toBeGreaterThanOrEqual(1);
    expect(state.accountAuthorizationHeaders[0]).toBe(`Bearer ${initialTokens.accessToken}`);
    expect(state.accountAuthorizationHeaders).toContain(`Bearer ${renewedTokens.accessToken}`);
    await expect.poll(() => state.refreshRequests).toBe(1);
    await expect.poll(() => new URL(page.url()).pathname).not.toBe("/auth");
    await expectStoredTokens(page, renewedTokens);
});

test("clears tokens and redirects to auth when refresh fails", async ({ page }) => {
    await seedTokens(page);
    await installReducedMotion(page);
    const state = createRouteState();
    await installApiRoutes(page, state, { refreshSucceeds: false });

    await page.goto("/rules");

    await expect.poll(() => state.accountRequests).toBe(1);
    await expect.poll(() => new URL(page.url()).pathname).toBe("/auth");
    expect(state.accountRequests).toBe(1);
    expect(state.refreshRequests).toBe(1);
    await expectStoredTokens(page, null);
});

test("does not run refresh loop for web login 401", async ({ page }) => {
    await installReducedMotion(page);
    const state = createRouteState();
    await installApiRoutes(page, state, {
        refreshSucceeds: true,
        loginReturnsUnauthorized: true,
    });

    await page.goto("/auth");
    const phoneInput = page.getByLabel("Телефон");
    await expect(phoneInput).toBeVisible();
    await phoneInput.fill("89393930920");
    await page.getByLabel("Пароль").fill("web-password");
    await page.getByRole("button", { name: "Войти", exact: true }).click();

    await expect.poll(() => state.loginRequests).toBe(1);
    expect(state.refreshRequests).toBe(0);
});
