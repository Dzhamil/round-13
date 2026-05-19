import { expect, type Locator, type Page } from "@playwright/test";

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
    const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
}

export async function expectVisibleWithoutCenterCover(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();

    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width ?? 0).toBeGreaterThan(8);
    expect(box?.height ?? 0).toBeGreaterThan(8);

    const visibleAtCenter = await locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const hit = document.elementFromPoint(centerX, centerY);

        return hit !== null && (hit === element || element.contains(hit) || hit.contains(element));
    });

    expect(visibleAtCenter).toBe(true);
}
