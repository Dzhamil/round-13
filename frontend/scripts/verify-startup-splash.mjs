import { spawn } from "node:child_process";
import { once } from "node:events";
import { access, mkdtemp, rm } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const WAIT_FOR_BLOCKED_MS = 3_500;
const WAIT_FOR_SHORT_FALLBACK_MS = 2_500;
const WAIT_FOR_NORMAL_RELEASE_MS = 13_000;
const STARTUP_TIMEOUT_MS = 15_000;

const CHROME_CANDIDATES = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
].filter(Boolean);

const scenarios = [
    {
        name: "autoplay-reject-keeps-overlay",
        harnessMode: "reject",
        waitMs: WAIT_FOR_BLOCKED_MS,
        viewport: { width: 390, height: 844, mobile: true },
        expect: (state) => {
            assert(state.hasOverlay, "overlay should remain visible after play() rejection");
            assert(state.diagnostics?.stage === "video", "stage should remain video after play() rejection");
            assert(state.diagnostics?.releaseReason === null, "releaseReason should stay null after play() rejection");
            assert(state.diagnostics?.autoplayBlockedCount > 0, "autoplayBlockedCount should be recorded");
        },
    },
    {
        name: "autoplay-stall-keeps-overlay",
        harnessMode: "stall",
        waitMs: WAIT_FOR_BLOCKED_MS,
        viewport: { width: 390, height: 844, mobile: true },
        expect: (state) => {
            assert(state.hasOverlay, "overlay should remain visible while play() promise stalls");
            assert(state.diagnostics?.stage === "video", "stage should remain video while play() promise stalls");
            assert(state.diagnostics?.releaseReason === null, "releaseReason should stay null while play() promise stalls");
            assert(state.playCalls > 0, "play() should be attempted");
        },
    },
    {
        name: "reduced-motion-releases-by-intentional-fallback",
        harnessMode: "reduced-motion",
        waitMs: WAIT_FOR_SHORT_FALLBACK_MS,
        viewport: { width: 390, height: 844, mobile: true },
        expect: (state) => {
            assert(!state.hasOverlay, "reduced-motion fallback should release overlay");
            assert(state.diagnostics?.releaseReason === "reduced-motion", "reduced-motion should be the release reason");
        },
    },
    {
        name: "media-error-releases-by-error-fallback",
        harnessMode: "media-error",
        waitMs: WAIT_FOR_SHORT_FALLBACK_MS,
        viewport: { width: 390, height: 844, mobile: true },
        expect: (state) => {
            assert(!state.hasOverlay, "true media error fallback should release overlay");
            assert(state.diagnostics?.releaseReason === "media-error", "media-error should be the release reason");
            assert(Boolean(state.diagnostics?.mediaError), "media error should be diagnosed");
        },
    },
    {
        name: "normal-desktop-releases-after-ended",
        harnessMode: "normal",
        waitMs: WAIT_FOR_NORMAL_RELEASE_MS,
        viewport: { width: 1280, height: 720, mobile: false },
        expect: (state) => {
            assert(!state.hasOverlay, "desktop playback should release overlay");
            assert(state.diagnostics?.releaseReason === "video-ended", "desktop release should require video-ended");
            assertDurationNearIntro(state);
        },
    },
    {
        name: "normal-mobile-releases-after-ended",
        harnessMode: "normal",
        waitMs: WAIT_FOR_NORMAL_RELEASE_MS,
        viewport: { width: 390, height: 844, mobile: true },
        expect: (state) => {
            assert(!state.hasOverlay, "mobile playback should release overlay");
            assert(state.diagnostics?.releaseReason === "video-ended", "mobile release should require video-ended");
            assertDurationNearIntro(state);
        },
    },
];

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main() {
    const frontendRoot = process.cwd();
    const vitePort = await getFreePort();
    const chromePort = await getFreePort();
    const appUrl = `https://127.0.0.1:${vitePort}/`;
    const chromeUserDataDir = await mkdtemp(path.join(os.tmpdir(), "round13-splash-chrome-"));
    const vite = spawn("npm", ["exec", "vite", "--", "--host", "127.0.0.1", "--port", String(vitePort)], {
        cwd: frontendRoot,
        stdio: ["ignore", "pipe", "pipe"],
    });
    const chrome = spawn(await findChrome(), [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--ignore-certificate-errors",
        "--autoplay-policy=no-user-gesture-required",
        `--remote-debugging-port=${chromePort}`,
        `--user-data-dir=${chromeUserDataDir}`,
        "about:blank",
    ], {
        stdio: ["ignore", "pipe", "pipe"],
    });

    try {
        await waitForHttps(appUrl, STARTUP_TIMEOUT_MS);
        const browser = await connectToBrowser(chromePort);

        try {
            for (const scenario of scenarios) {
                const state = await runScenario(browser, appUrl, scenario);
                scenario.expect(state);
                console.log(formatScenarioResult(scenario.name, state));
            }
        } finally {
            await browser.close();
        }
    } finally {
        await terminateProcess(vite);
        await terminateProcess(chrome);
        await rm(chromeUserDataDir, {
            recursive: true,
            force: true,
            maxRetries: 5,
            retryDelay: 200,
        });
    }
}

async function runScenario(browser, appUrl, scenario) {
    const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await browser.send("Target.attachToTarget", {
        targetId,
        flatten: true,
    });

    browser.on("Fetch.requestPaused", async ({ params, sessionId: eventSessionId }) => {
        if (eventSessionId !== sessionId) {
            return;
        }

        if (scenario.harnessMode === "media-error" && params.request.url.includes("/videos/round13-startup-intro.mp4")) {
            await browser.send("Fetch.failRequest", {
                requestId: params.requestId,
                errorReason: "Failed",
            }, sessionId);
            return;
        }

        await browser.send("Fetch.continueRequest", { requestId: params.requestId }, sessionId);
    });

    await browser.send("Page.enable", {}, sessionId);
    await browser.send("Runtime.enable", {}, sessionId);
    await browser.send("Fetch.enable", { patterns: [{ urlPattern: "*" }] }, sessionId);
    await browser.send("Page.addScriptToEvaluateOnNewDocument", {
        source: createPreloadScript(scenario.harnessMode),
    }, sessionId);
    await browser.send("Emulation.setDeviceMetricsOverride", {
        width: scenario.viewport.width,
        height: scenario.viewport.height,
        deviceScaleFactor: scenario.viewport.mobile ? 3 : 1,
        mobile: scenario.viewport.mobile,
    }, sessionId);

    await browser.send("Page.navigate", {
        url: `${appUrl}?splashHarness=${encodeURIComponent(scenario.harnessMode)}`,
    }, sessionId);
    await delay(scenario.waitMs);

    const state = await evaluateState(browser, sessionId);
    await browser.send("Target.closeTarget", { targetId });
    return state;
}

function createPreloadScript(mode) {
    return `
(() => {
  const mode = ${JSON.stringify(mode)};
  window.__splashHarnessPlayCalls = 0;

  if (mode === "reduced-motion") {
    const originalMatchMedia = window.matchMedia?.bind(window);
    window.matchMedia = (query) => {
      if (query === "(prefers-reduced-motion: reduce)") {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent() { return false; },
        };
      }

      return originalMatchMedia ? originalMatchMedia(query) : { matches: false, media: query };
    };
  }

  if (mode !== "reject" && mode !== "stall") {
    return;
  }

  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function patchedPlay() {
    window.__splashHarnessPlayCalls += 1;

    if (mode === "reject") {
      return Promise.reject(new DOMException("Harness autoplay blocked", "NotAllowedError"));
    }

    return new Promise(() => {});
  };
  HTMLMediaElement.prototype.play.__round13OriginalPlay = originalPlay;
})();
`;
}

async function evaluateState(browser, sessionId) {
    const expression = `(() => ({
        hasOverlay: Boolean(document.querySelector('[data-startup-splash="overlay"]')),
        overlayStage: document.querySelector('[data-startup-splash="overlay"]')?.getAttribute('data-startup-splash-stage') ?? null,
        hasVideo: Boolean(document.querySelector('[data-startup-splash-video="intro"]')),
        playCalls: window.__splashHarnessPlayCalls ?? 0,
        diagnostics: window.__round13StartupSplash ?? null,
        bodyText: document.body.innerText.slice(0, 200),
    }))()`;
    const result = await browser.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
    }, sessionId);

    if (result.exceptionDetails) {
        throw new Error(`Runtime evaluation failed: ${JSON.stringify(result.exceptionDetails)}`);
    }

    return result.result.value;
}

function assertDurationNearIntro(state) {
    const diagnostics = state.diagnostics ?? {};
    const duration = diagnostics.duration;
    const endedAt = diagnostics.endedAt;
    const completedAt = diagnostics.completedAt;

    assert(typeof duration === "number", "diagnostics should include video duration");
    assert(duration >= 7.5 && duration <= 8.5, `expected intro duration near 8s, got ${duration}`);
    assert(typeof endedAt === "number", "diagnostics should include endedAt");
    assert(typeof completedAt === "number", "diagnostics should include completedAt");

    const postEndedHoldMs = completedAt - endedAt;
    assert(
        postEndedHoldMs >= 900 && postEndedHoldMs <= 1_600,
        `expected post-ended hold near 1000ms, got ${postEndedHoldMs.toFixed(0)}ms`,
    );
}

function formatScenarioResult(name, state) {
    const diagnostics = state.diagnostics ?? {};
    const duration = typeof diagnostics.duration === "number" ? diagnostics.duration.toFixed(3) : "n/a";
    const hold = typeof diagnostics.endedAt === "number" && typeof diagnostics.completedAt === "number"
        ? `${(diagnostics.completedAt - diagnostics.endedAt).toFixed(0)}ms`
        : "n/a";

    return [
        `PASS ${name}`,
        `overlay=${state.hasOverlay}`,
        `stage=${diagnostics.stage ?? "n/a"}`,
        `release=${diagnostics.releaseReason ?? "none"}`,
        `playAttempts=${diagnostics.playAttempts ?? 0}`,
        `blocked=${diagnostics.autoplayBlockedCount ?? 0}`,
        `duration=${duration}`,
        `hold=${hold}`,
    ].join(" ");
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function connectToBrowser(port) {
    const versionUrl = `http://127.0.0.1:${port}/json/version`;
    const version = await waitForJson(versionUrl, STARTUP_TIMEOUT_MS);
    const client = new CdpClient(version.webSocketDebuggerUrl);
    await client.open();
    return client;
}

class CdpClient {
    constructor(webSocketUrl) {
        this.nextId = 1;
        this.pending = new Map();
        this.listeners = new Map();
        this.webSocket = new WebSocket(webSocketUrl);
    }

    open() {
        return new Promise((resolve, reject) => {
            this.webSocket.addEventListener("open", resolve, { once: true });
            this.webSocket.addEventListener("error", reject, { once: true });
            this.webSocket.addEventListener("message", (event) => this.handleMessage(event));
        });
    }

    send(method, params = {}, sessionId) {
        const id = this.nextId;
        this.nextId += 1;

        const message = { id, method, params };

        if (sessionId) {
            message.sessionId = sessionId;
        }

        const response = new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
        });

        this.webSocket.send(JSON.stringify(message));
        return response;
    }

    on(method, listener) {
        const listeners = this.listeners.get(method) ?? [];
        listeners.push(listener);
        this.listeners.set(method, listeners);
    }

    async close() {
        if (this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.close();
        }
    }

    handleMessage(event) {
        const message = JSON.parse(event.data);

        if (message.id) {
            const pending = this.pending.get(message.id);
            this.pending.delete(message.id);

            if (!pending) {
                return;
            }

            if (message.error) {
                pending.reject(new Error(`${message.error.message}: ${JSON.stringify(message.error.data ?? {})}`));
                return;
            }

            pending.resolve(message.result ?? {});
            return;
        }

        const listeners = this.listeners.get(message.method) ?? [];
        for (const listener of listeners) {
            void listener(message);
        }
    }
}

async function waitForHttps(url, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        try {
            await request(url, { rejectUnauthorized: false });
            return;
        } catch {
            await delay(250);
        }
    }

    throw new Error(`Timed out waiting for ${url}`);
}

async function waitForJson(url, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        try {
            return JSON.parse(await request(url));
        } catch {
            await delay(250);
        }
    }

    throw new Error(`Timed out waiting for ${url}`);
}

function request(url, options = {}) {
    const client = url.startsWith("https:") ? https : http;

    return new Promise((resolve, reject) => {
        const req = client.get(url, options, (res) => {
            let body = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                if ((res.statusCode ?? 500) >= 400) {
                    reject(new Error(`HTTP ${res.statusCode}: ${url}`));
                    return;
                }

                resolve(body);
            });
        });

        req.on("error", reject);
        req.setTimeout(2_000, () => {
            req.destroy(new Error(`Timeout: ${url}`));
        });
    });
}

async function findChrome() {
    for (const candidate of CHROME_CANDIDATES) {
        try {
            await access(candidate);
            return candidate;
        } catch {
            // Try the next known Chrome path.
        }
    }

    throw new Error("Chrome executable was not found. Set CHROME_PATH to run this harness.");
}

function getFreePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            server.close(() => {
                if (!address || typeof address === "string") {
                    reject(new Error("Unable to allocate a local port"));
                    return;
                }

                resolve(address.port);
            });
        });
        server.on("error", reject);
    });
}

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function terminateProcess(childProcess) {
    if (childProcess.exitCode !== null || childProcess.signalCode !== null) {
        return;
    }

    childProcess.kill("SIGTERM");

    const closed = once(childProcess, "close");
    const forced = delay(3_000).then(() => {
        if (childProcess.exitCode === null && childProcess.signalCode === null) {
            childProcess.kill("SIGKILL");
        }
    });

    await Promise.race([closed, forced]);
}
