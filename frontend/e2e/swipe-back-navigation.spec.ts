import { expect, test, type Page } from "@playwright/test";

type SwipeOptions = {
    endX?: number;
    endY?: number;
    startX?: number;
    startY?: number;
    targetSelector?: string;
};

const completeProfile = {
    id: "test-user",
    phone: "+79990000000",
    nickname: "Swipe Tester",
    role: "USER",
    status: "ACTIVE",
    avatarUrl: "https://example.test/avatar.png",
    gender: "MALE",
    profileCompleted: true,
};

const shopCategory = {
    id: "gear",
    title: "Gear",
    description: "Training gear",
    type: "MERCH",
    previewImageUrl: null,
    active: true,
};

const shopProduct = {
    id: "gloves",
    code: "gloves",
    title: "Gloves",
    description: "Bag gloves",
    categoryId: shopCategory.id,
    categoryTitle: shopCategory.title,
    category: "MERCH",
    priceAmount: 199000,
    currency: "RUB",
    imageDataUrl: "",
    isActive: true,
    sortOrder: 1,
};

function apiResponseFor(pathname: string): unknown {
    if (pathname === "/api/account/me") {
        return completeProfile;
    }

    if (pathname === "/api/members" || pathname === "/api/members/my-students") {
        return { items: [] };
    }

    if (pathname === "/api/shop/categories") {
        return [shopCategory];
    }

    if (pathname === "/api/shop/catalog" ||
        pathname === "/api/shop/products" ||
        pathname === `/api/shop/categories/${shopCategory.id}/products`) {
        return [shopProduct];
    }

    if (pathname === `/api/shop/catalog/${shopProduct.code}` ||
        pathname === `/api/shop/products/code/${shopProduct.code}`) {
        return shopProduct;
    }

    if (pathname === "/api/account/schedule" || pathname === "/api/trainer/schedule") {
        return [];
    }

    if (pathname === "/api/shop/orders" ||
        pathname === "/api/admin/shop/orders/pending" ||
        pathname === "/api/admin/shop/orders/history") {
        return [];
    }

    return {};
}

async function preparePrivatePage(page: Page, pathname: string): Promise<void> {
    await page.route("**/api/**", async (route) => {
        const url = new URL(route.request().url());

        if (!url.pathname.startsWith("/api/")) {
            await route.continue();
            return;
        }

        await route.fulfill({
            body: JSON.stringify(apiResponseFor(url.pathname)),
            contentType: "application/json",
            status: 200,
        });
    });

    await page.addInitScript(() => {
        localStorage.setItem("accessToken", "test-access-token");
        localStorage.setItem("refreshToken", "test-refresh-token");

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

    await page.goto(pathname);
    await page.waitForFunction(() => document.querySelector("header") !== null);
    await expect.poll(() => new URL(page.url()).pathname).toBe(pathname);
}

async function dispatchTouchSwipe(page: Page, options: SwipeOptions = {}): Promise<void> {
    await page.evaluate((args) => {
        const startX = args.startX ?? 8;
        const startY = args.startY ?? 420;
        const endX = args.endX ?? 132;
        const endY = args.endY ?? startY + 6;
        const target = args.targetSelector
            ? document.querySelector(args.targetSelector)
            : document.elementFromPoint(startX, startY);

        if (!target) {
            throw new Error("Swipe target not found");
        }

        target.dispatchEvent(new PointerEvent("pointerdown", {
            bubbles: true,
            cancelable: true,
            clientX: startX,
            clientY: startY,
            isPrimary: true,
            pointerId: 13,
            pointerType: "touch",
        }));

        target.dispatchEvent(new PointerEvent("pointerup", {
            bubbles: true,
            cancelable: true,
            clientX: endX,
            clientY: endY,
            isPrimary: true,
            pointerId: 13,
            pointerType: "touch",
        }));
    }, options);
}

async function expectPath(page: Page, pathname: string): Promise<void> {
    await expect.poll(() => new URL(page.url()).pathname).toBe(pathname);
}

test("swipes from members back to home", async ({ page }) => {
    await preparePrivatePage(page, "/members");
    await dispatchTouchSwipe(page);
    await expectPath(page, "/");
});

test("keeps the header back arrow working", async ({ page }) => {
    await preparePrivatePage(page, "/members");
    await page.getByRole("button", { name: "Назад" }).click();
    await expectPath(page, "/");
});

test("swipes from shop product back to shop", async ({ page }) => {
    await preparePrivatePage(page, "/shop/gloves");
    await dispatchTouchSwipe(page);
    await expectPath(page, "/shop");
});

test("swipes from blank-title timetable day back to timetable", async ({ page }) => {
    await preparePrivatePage(page, "/timetable/day/2026-05-24");
    await dispatchTouchSwipe(page);
    await expectPath(page, "/timetable");
});

test("does not navigate on root, vertical movement, inputs, modals, or excluded surfaces", async ({ page }) => {
    await preparePrivatePage(page, "/");
    await dispatchTouchSwipe(page);
    await page.waitForTimeout(150);
    await expectPath(page, "/");

    await preparePrivatePage(page, "/members");
    await dispatchTouchSwipe(page, { endX: 36, endY: 620 });
    await page.waitForTimeout(150);
    await expectPath(page, "/members");

    await page.evaluate(() => {
        const input = document.createElement("input");
        input.id = "swipe-input-fixture";
        input.style.cssText = "position: fixed; left: 0; top: 360px; width: 48px; height: 48px; z-index: 9999;";
        document.body.appendChild(input);
    });
    await dispatchTouchSwipe(page, { targetSelector: "#swipe-input-fixture" });
    await page.waitForTimeout(150);
    await expectPath(page, "/members");

    await page.evaluate(() => {
        document.querySelector("#swipe-input-fixture")?.remove();
        const dialog = document.createElement("div");
        dialog.id = "swipe-dialog-fixture";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.style.cssText = "position: fixed; inset: 0; z-index: 9999;";
        document.body.appendChild(dialog);
    });
    await dispatchTouchSwipe(page, { targetSelector: "#swipe-dialog-fixture" });
    await page.waitForTimeout(150);
    await expectPath(page, "/members");

    await page.evaluate(() => {
        document.querySelector("#swipe-dialog-fixture")?.remove();
        const excluded = document.createElement("div");
        excluded.id = "swipe-exclude-fixture";
        excluded.setAttribute("data-swipe-back-exclude", "");
        excluded.style.cssText = "position: fixed; left: 0; top: 360px; width: 64px; height: 64px; z-index: 9999;";
        document.body.appendChild(excluded);
    });
    await dispatchTouchSwipe(page, { targetSelector: "#swipe-exclude-fixture" });
    await page.waitForTimeout(150);
    await expectPath(page, "/members");
});
