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
const PROCESS_GRACEFUL_SHUTDOWN_MS = 3_000;
const PROCESS_FORCED_SHUTDOWN_MS = 3_000;
const CDP_CLOSE_TIMEOUT_MS = 3_000;

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
            assert(
                state.diagnostics?.stage === "autoplay-fallback",
                `play() rejection should switch to controlled autoplay fallback, got ${describeState(state)}`,
            );
            assert(state.diagnostics?.releaseReason === null, "releaseReason should stay null after play() rejection");
            assert(state.diagnostics?.autoplayBlockedCount > 0, "autoplayBlockedCount should be recorded");
            assertControlledFallbackSurface(state, "play() rejection");
            assertNoNativeManualPlaySurface(state, "play() rejection");
        },
    },
    {
        name: "autoplay-stall-keeps-overlay",
        harnessMode: "stall",
        waitMs: WAIT_FOR_BLOCKED_MS,
        viewport: { width: 390, height: 844, mobile: true },
        expect: (state) => {
            assert(state.hasOverlay, "overlay should remain visible while play() promise stalls");
            assert(
                state.diagnostics?.stage === "autoplay-fallback",
                `stalled play() should switch to controlled autoplay fallback, got ${describeState(state)}`,
            );
            assert(state.diagnostics?.releaseReason === null, "releaseReason should stay null while play() promise stalls");
            assert(state.playCalls > 0, "play() should be attempted");
            assertControlledFallbackSurface(state, "stalled play()");
            assertNoNativeManualPlaySurface(state, "stalled play()");
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
    const vite = spawnManaged(await findVite(frontendRoot), ["--host", "127.0.0.1", "--port", String(vitePort)], {
        cwd: frontendRoot,
    });
    const chrome = spawnManaged(await findChrome(), [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--ignore-certificate-errors",
        "--autoplay-policy=no-user-gesture-required",
        `--remote-debugging-port=${chromePort}`,
        `--user-data-dir=${chromeUserDataDir}`,
        "about:blank",
    ]);

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

    const removeFetchListener = browser.on("Fetch.requestPaused", async ({ params, sessionId: eventSessionId }) => {
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

    try {
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

        return await evaluateState(browser, sessionId);
    } finally {
        removeFetchListener();
        await browser.send("Fetch.disable", {}, sessionId).catch(() => undefined);
        await browser.send("Target.closeTarget", { targetId }).catch(() => undefined);
    }
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

  const stopNativeAutoplay = (event) => {
    if (!(event.target instanceof HTMLMediaElement)) {
      return;
    }

    try {
      event.target.pause();
      event.target.currentTime = 0;
    } catch {
      // Keep the harness focused on blocking visible native playback.
    }
  };
  document.addEventListener("play", stopNativeAutoplay, true);
  document.addEventListener("playing", stopNativeAutoplay, true);

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
        videoVisibleAttr: document.querySelector('[data-startup-splash-video="intro"]')?.getAttribute('data-startup-splash-video-visible') ?? null,
        nativeVideoVisible: (() => {
            const video = document.querySelector('[data-startup-splash-video="intro"]');
            if (!video) {
                return false;
            }

            const styles = getComputedStyle(video);
            const rect = video.getBoundingClientRect();
            return styles.display !== "none"
                && styles.visibility !== "hidden"
                && Number(styles.opacity) > 0.01
                && rect.width > 1
                && rect.height > 1;
        })(),
        hasAppFallbackSurface: Boolean(document.querySelector('[data-startup-splash-surface="app-fallback"]')),
        appFallbackSurfaceVisible: (() => {
            const surface = document.querySelector('[data-startup-splash-surface="app-fallback"]');
            if (!surface) {
                return false;
            }

            const styles = getComputedStyle(surface);
            const rect = surface.getBoundingClientRect();
            return styles.display !== "none"
                && styles.visibility !== "hidden"
                && Number(styles.opacity || "1") > 0.01
                && rect.width > 1
                && rect.height > 1;
        })(),
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

function assertControlledFallbackSurface(state, context) {
    assert(state.hasAppFallbackSurface, `${context} should render the app-controlled fallback surface`);
    assert(state.appFallbackSurfaceVisible, `${context} fallback surface should be visible`);
    assert(
        state.diagnostics?.visibleSurface === "app-controlled-fallback",
        `${context} diagnostics should identify app-controlled fallback as the visible surface`,
    );
    assert(
        state.diagnostics?.controlledFallbackDurationMs >= 9_000,
        `${context} should expose a deterministic fallback duration at least as long as the 8s intro plus hold`,
    );
    assert(
        state.diagnostics?.soundPolicy === "visual-intro-muted-autoplay; sound-autoplay-not-required",
        `${context} should diagnose that sound autoplay is not required for the visual intro`,
    );
}

function assertNoNativeManualPlaySurface(state, context) {
    assert(!state.nativeVideoVisible, `${context} must not leave native video as the visible surface`);
    assert(
        state.videoVisibleAttr !== "true",
        `${context} must not mark the native video visible after autoplay block/stall`,
    );
}

function describeState(state) {
    return JSON.stringify({
        overlay: state.hasOverlay,
        overlayStage: state.overlayStage,
        playCalls: state.playCalls,
        nativeVideoVisible: state.nativeVideoVisible,
        appFallbackSurfaceVisible: state.appFallbackSurfaceVisible,
        diagnostics: {
            stage: state.diagnostics?.stage ?? null,
            lastEvent: state.diagnostics?.lastEvent ?? null,
            visibleSurface: state.diagnostics?.visibleSurface ?? null,
            playAttempts: state.diagnostics?.playAttempts ?? null,
            autoplayBlockedCount: state.diagnostics?.autoplayBlockedCount ?? null,
            autoplayFallbackCount: state.diagnostics?.autoplayFallbackCount ?? null,
            autoplayFallbackReason: state.diagnostics?.autoplayFallbackReason ?? null,
        },
    });
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
        `surface=${diagnostics.visibleSurface ?? "n/a"}`,
        `playAttempts=${diagnostics.playAttempts ?? 0}`,
        `blocked=${diagnostics.autoplayBlockedCount ?? 0}`,
        `fallbacks=${diagnostics.autoplayFallbackCount ?? 0}`,
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
        this.isClosing = false;
        this.webSocket = new WebSocket(webSocketUrl);
        this.handleMessageBound = (event) => this.handleMessage(event);
        this.handleTransportClosedBound = () => {
            this.rejectPending(new Error("CDP connection closed"));
        };
    }

    open() {
        return new Promise((resolve, reject) => {
            const cleanup = () => {
                this.webSocket.removeEventListener("open", handleOpen);
                this.webSocket.removeEventListener("error", handleError);
                this.webSocket.removeEventListener("close", handleClose);
            };
            const handleOpen = () => {
                cleanup();
                this.webSocket.addEventListener("message", this.handleMessageBound);
                this.webSocket.addEventListener("error", this.handleTransportClosedBound);
                this.webSocket.addEventListener("close", this.handleTransportClosedBound);
                resolve();
            };
            const handleError = () => {
                cleanup();
                reject(new Error("CDP WebSocket failed to open"));
            };
            const handleClose = () => {
                cleanup();
                reject(new Error("CDP WebSocket closed before opening"));
            };

            this.webSocket.addEventListener("open", handleOpen, { once: true });
            this.webSocket.addEventListener("error", handleError, { once: true });
            this.webSocket.addEventListener("close", handleClose, { once: true });
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

        return () => {
            const currentListeners = this.listeners.get(method) ?? [];
            this.listeners.set(method, currentListeners.filter((currentListener) => currentListener !== listener));
        };
    }

    async close() {
        this.isClosing = true;

        if (this.webSocket.readyState === WebSocket.CLOSED) {
            this.cleanupTransport();
            return;
        }

        const closed = new Promise((resolve) => {
            const handleClosed = () => {
                this.webSocket.removeEventListener("close", handleClosed);
                this.webSocket.removeEventListener("error", handleClosed);
                resolve();
            };

            this.webSocket.addEventListener("close", handleClosed, { once: true });
            this.webSocket.addEventListener("error", handleClosed, { once: true });
        });

        if (this.webSocket.readyState === WebSocket.OPEN || this.webSocket.readyState === WebSocket.CONNECTING) {
            this.webSocket.close();
        }

        await Promise.race([closed, delay(CDP_CLOSE_TIMEOUT_MS)]);
        this.cleanupTransport();
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
            void Promise.resolve(listener(message)).catch((error) => {
                if (!this.isClosing) {
                    console.error(`CDP listener failed for ${message.method}:`, error);
                }
            });
        }
    }

    cleanupTransport() {
        this.webSocket.removeEventListener("message", this.handleMessageBound);
        this.webSocket.removeEventListener("error", this.handleTransportClosedBound);
        this.webSocket.removeEventListener("close", this.handleTransportClosedBound);
        this.listeners.clear();
        this.rejectPending(new Error("CDP connection closed"));
    }

    rejectPending(error) {
        for (const pending of this.pending.values()) {
            pending.reject(error);
        }

        this.pending.clear();
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

async function findVite(frontendRoot) {
    const executableName = process.platform === "win32" ? "vite.cmd" : "vite";
    const localVite = path.join(frontendRoot, "node_modules", ".bin", executableName);

    try {
        await access(localVite);
        return localVite;
    } catch {
        return executableName;
    }
}

function spawnManaged(command, args, options = {}) {
    return spawn(command, args, {
        ...options,
        detached: process.platform !== "win32",
        stdio: "ignore",
    });
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

    const closed = once(childProcess, "close").then(() => undefined);

    signalProcessTree(childProcess, "SIGTERM");

    const gracefullyClosed = await Promise.race([
        closed.then(() => true),
        delay(PROCESS_GRACEFUL_SHUTDOWN_MS).then(() => false),
    ]);

    if (gracefullyClosed) {
        return;
    }

    signalProcessTree(childProcess, "SIGKILL");

    const forceClosed = await Promise.race([
        closed.then(() => true),
        delay(PROCESS_FORCED_SHUTDOWN_MS).then(() => false),
    ]);

    if (!forceClosed && childProcess.exitCode === null && childProcess.signalCode === null) {
        throw new Error(`Timed out terminating child process ${childProcess.pid ?? "unknown"}`);
    }
}

function signalProcessTree(childProcess, signal) {
    if (!childProcess.pid) {
        return;
    }

    try {
        if (process.platform === "win32") {
            childProcess.kill(signal);
            return;
        }

        process.kill(-childProcess.pid, signal);
    } catch (error) {
        if (error?.code !== "ESRCH") {
            throw error;
        }
    }
}
