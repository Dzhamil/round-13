import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5174";

export default defineConfig({
    testDir: "./e2e",
    reporter: "list",
    timeout: 30_000,
    use: {
        baseURL,
        hasTouch: true,
        ignoreHTTPSErrors: true,
        isMobile: true,
        viewport: {
            width: 390,
            height: 844,
        },
    },
    webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
        ? undefined
        : {
            command: "VITE_DEV_HTTPS=false npm run dev -- --host 127.0.0.1 --port 5174",
            reuseExistingServer: true,
            timeout: 120_000,
            url: baseURL,
        },
});
