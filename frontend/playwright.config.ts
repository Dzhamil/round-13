import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5174";

export default defineConfig({
    testDir: ".",
    reporter: "list",
    timeout: 30_000,
    use: {
        baseURL,
        ignoreHTTPSErrors: true,
    },
    projects: [
        {
            name: "chromium-mobile",
            use: {
                ...devices["Pixel 5"],
                baseURL,
                viewport: {
                    width: 390,
                    height: 844,
                },
            },
        },
        {
            name: "chromium-desktop-admin",
            use: {
                ...devices["Desktop Chrome"],
                baseURL,
                viewport: {
                    width: 1280,
                    height: 720,
                },
            },
        },
    ],
    webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
        ? undefined
        : {
            command: process.env.PLAYWRIGHT_SERVE_DIST
                ? "VITE_DEV_HTTPS=false npm run preview -- --host 127.0.0.1 --port 5174 --strictPort"
                : "VITE_DEV_HTTPS=false npm run dev -- --host 127.0.0.1 --port 5174",
            reuseExistingServer: !process.env.PLAYWRIGHT_SERVE_DIST,
            timeout: 120_000,
            url: baseURL,
        },
});
