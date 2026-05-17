import { expect, type Page } from "@playwright/test";

type ConsoleGuard = {
    assertClean: () => Promise<void>;
};

const IGNORED_CONSOLE_PATTERNS = [
    /favicon/i,
    /Failed to load resource: the server responded with a status of (401|403)/i,
    /ResizeObserver loop completed/i,
];

function isIgnoredConsoleMessage(text: string): boolean {
    return IGNORED_CONSOLE_PATTERNS.some((pattern) => pattern.test(text));
}

export function installConsoleGuards(page: Page): ConsoleGuard {
    const failures: string[] = [];

    page.on("pageerror", (error) => {
        failures.push(`pageerror: ${error.message}`);
    });

    page.on("console", (message) => {
        if (message.type() !== "error") {
            return;
        }

        const text = message.text();
        if (!isIgnoredConsoleMessage(text)) {
            failures.push(`console.error: ${text}`);
        }
    });

    return {
        async assertClean() {
            await expect(page.locator("vite-error-overlay, #vite-error-overlay, .vite-error-overlay")).toHaveCount(0);
            expect(failures).toEqual([]);
        },
    };
}
