import { defineConfig, devices } from "@playwright/test";

const DEFAULT_FRONTEND_URL = "https://localhost.127.0.0.1.nip.io:5173";
const baseURL = process.env.QA_FRONTEND_URL?.trim() || DEFAULT_FRONTEND_URL;
const parsedBaseURL = new URL(baseURL);
const devHost = process.env.VITE_DEV_HOST?.trim() || parsedBaseURL.hostname;
const devPort = process.env.VITE_DEV_PORT?.trim() || parsedBaseURL.port || "5173";
const apiProxyTarget = process.env.QA_API_BASE_URL?.trim()
    || process.env.VITE_DEV_API_PROXY_TARGET?.trim()
    || "http://127.0.0.1:8080";
const webServerReadyCheck = parsedBaseURL.protocol === "http:"
    ? { url: baseURL }
    : { port: Number(devPort) };

export default defineConfig({
    testDir: "./tests/e2e",
    timeout: 45_000,
    expect: {
        timeout: 8_000,
    },
    fullyParallel: false,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
    webServer: process.env.QA_SKIP_WEBSERVER
        ? undefined
        : {
            command: `npm run dev -- --host ${devHost} --port ${devPort}`,
            ...webServerReadyCheck,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
            env: {
                ...process.env,
                VITE_DEV_HOST: devHost,
                VITE_DEV_PORT: devPort,
                VITE_DEV_API_PROXY_TARGET: apiProxyTarget,
            },
        },
    use: {
        baseURL,
        ignoreHTTPSErrors: true,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium-mobile",
            use: {
                ...devices["Pixel 5"],
                viewport: { width: 390, height: 844 },
                isMobile: true,
                hasTouch: true,
                reducedMotion: "reduce",
                timezoneId: "Europe/Moscow",
            },
        },
        {
            name: "chromium-desktop-admin",
            use: {
                ...devices["Desktop Chrome"],
                viewport: { width: 1280, height: 900 },
                reducedMotion: "reduce",
                timezoneId: "Europe/Moscow",
            },
        },
    ],
});
