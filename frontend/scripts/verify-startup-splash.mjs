import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const WAIT_FOR_AUTOMATIC_START_MS = 900;
const WAIT_FOR_VIDEO_SURFACE_MS = 3_000;
const WAIT_FOR_FALLBACK_SURFACE_MS = 5_000;
const WAIT_FOR_SHORT_FALLBACK_MS = 2_500;
const WAIT_FOR_NORMAL_RELEASE_MS = 13_000;
const WAIT_FOR_FALLBACK_RELEASE_MS = 11_500;
const STARTUP_TIMEOUT_MS = 15_000;
const PROCESS_GRACEFUL_SHUTDOWN_MS = 3_000;
const PROCESS_FORCED_SHUTDOWN_MS = 3_000;
const CDP_CLOSE_TIMEOUT_MS = 3_000;
const INTRO_VIDEO_PUBLIC_PATH = "/videos/round13-startup-intro.mp4";
const FALLBACK_MANIFEST_PUBLIC_PATH = "/generated/startup-splash-fallback/manifest.json";
const FALLBACK_FRAME_PUBLIC_PATH_PREFIX = "/generated/startup-splash-fallback/frame-";
const FALLBACK_VISUAL_SOURCE = "mp4-frame-sequence";
const MIN_FALLBACK_FRAME_COUNT = 16;

const CHROME_CANDIDATES = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
].filter(Boolean);

let verifiedFallbackManifest = null;

const scenarios = [
    {
        name: "automatic-start-without-gesture",
        harnessMode: "normal",
        waitMs: WAIT_FOR_AUTOMATIC_START_MS,
        viewport: { width: 390, height: 844, mobile: true },
        expect: (state) => {
            assert(state.hasOverlay, "overlay should remain visible while the automatic intro starts");
            assert(
                state.diagnostics?.stage === "starting-audio" || state.diagnostics?.stage === "video-audio",
                `automatic start should enter playback without a gesture, got ${describeState(state)}`,
            );
            assertNoManualStartSurface(state, "automatic start");
            assertAutomaticUnmutedStart(state, "automatic start");
            assertNoCanvasLoop(state, "automatic start");
            assertNoNativeManualPlaySurface(state, "automatic start", { allowNativeVisible: true });
        },
    },
    {
        name: "automatic-audio-starts-native-video",
        harnessMode: "normal",
        waitMs: WAIT_FOR_VIDEO_SURFACE_MS,
        viewport: { width: 390, height: 844, mobile: true },
        expect: (state) => {
            assert(state.hasOverlay, "normal playback should still be in the intro at 3s");
            assert(
                state.diagnostics?.stage === "video-audio",
                `automatic playback should enter video-audio stage, got ${describeState(state)}`,
            );
            assertNoManualStartSurface(state, "normal automatic playback");
            assertAutomaticUnmutedStart(state, "normal automatic playback");
            assertNativeVideoSurface(state, "normal automatic playback", { muted: false });
            assertNoCanvasLoop(state, "normal automatic playback");
            assertNoNativeManualPlaySurface(state, "normal automatic playback", { allowNativeVisible: true });
        },
    },
    {
        name: "audio-autoplay-rejects-falls-back-to-muted-native-video",
        harnessMode: "audio-reject",
        waitMs: WAIT_FOR_VIDEO_SURFACE_MS,
        viewport: { width: 390, height: 844, mobile: true },
        expect: (state) => {
            assert(state.hasOverlay, "muted video fallback should keep the intro overlay visible at 3s");
            assert(
                state.diagnostics?.stage === "video-muted",
                `rejected audio should enter video-muted stage, got ${describeState(state)}`,
            );
            assertNoManualStartSurface(state, "rejected audio autoplay");
            assertAutomaticUnmutedStart(state, "rejected audio autoplay");
            assert(
                state.playCallRecords.some((call) => call.muted === true),
                "rejected audio path should attempt a muted video fallback",
            );
            assert(state.diagnostics?.audioRejectedCount >= 1, "audio rejection should be diagnosed");
            assertNativeVideoSurface(state, "muted video fallback", { muted: true });
            assertNoCanvasLoop(state, "muted video fallback");
            assertNoNativeManualPlaySurface(state, "muted video fallback", { allowNativeVisible: true });
        },
    },
    {
        name: "all-play-rejects-uses-frame-fallback-and-releases",
        harnessMode: "all-reject",
        waitMs: WAIT_FOR_FALLBACK_RELEASE_MS,
        visualSampleAtMs: [3_500, 4_800],
        viewport: { width: 390, height: 844, mobile: true },
        expect: (state) => {
            assert(!state.hasOverlay, "all-play-reject fallback should eventually release overlay");
            assert(state.diagnostics?.releaseReason === "frame-fallback", "all-play-reject should release by frame fallback");
            assertNoManualStartSurface(state, "all-play-reject");
            assertAutomaticUnmutedStart(state, "all-play-reject");
            assertControlledFallbackSurface(state, "all-play-reject", { requireLongDuration: true, finalMayBeReleased: true });
            assertFallbackVisualProgression(state, "all-play-reject");
            assertNoCanvasLoop(state, "all-play-reject");
            assertNoNativeManualPlaySurface(state, "all-play-reject", { allowNativeVisible: false });
        },
    },
    {
        name: "play-stall-uses-frame-fallback",
        harnessMode: "stall",
        waitMs: WAIT_FOR_FALLBACK_SURFACE_MS,
        visualSampleAtMs: [3_200, 4_500],
        viewport: { width: 390, height: 844, mobile: true },
        expect: (state) => {
            assert(state.hasOverlay, "stalled playback should still be under app overlay while fallback runs");
            assert(
                state.diagnostics?.stage === "frame-fallback",
                `stalled playback should switch to frame fallback, got ${describeState(state)}`,
            );
            assertNoManualStartSurface(state, "stalled playback");
            assertAutomaticUnmutedStart(state, "stalled playback");
            assertControlledFallbackSurface(state, "stalled playback", { requireLongDuration: true });
            assertFallbackVisualProgression(state, "stalled playback");
            assertNoCanvasLoop(state, "stalled playback");
            assertNoNativeManualPlaySurface(state, "stalled playback", { allowNativeVisible: false });
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
            assertNoManualStartSurface(state, "reduced-motion");
            assertNoCanvasLoop(state, "reduced-motion");
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
            assertNoManualStartSurface(state, "media-error");
            assertNoCanvasLoop(state, "media-error");
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
            assertNoManualStartSurface(state, "mobile release");
            assertAutomaticUnmutedStart(state, "mobile release");
            assertDurationNearIntro(state);
            assertNoCanvasLoop(state, "mobile release");
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
            assertNoManualStartSurface(state, "desktop release");
            assertAutomaticUnmutedStart(state, "desktop release");
            assertDurationNearIntro(state);
            assertNoCanvasLoop(state, "desktop release");
        },
    },
];

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main() {
    const frontendRoot = process.cwd();
    const startupAssets = await loadAndVerifyStartupAssets(frontendRoot);
    verifiedFallbackManifest = startupAssets.manifest;
    console.log(formatMp4Guard(startupAssets.mp4Metadata));

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
        await waitForOverlay(browser, sessionId);

        const visualSamples = [];
        let elapsedMs = 0;

        for (const sampleAtMs of scenario.visualSampleAtMs ?? []) {
            const delayMs = sampleAtMs - elapsedMs;

            if (delayMs > 0) {
                await delay(delayMs);
                elapsedMs = sampleAtMs;
            }

            visualSamples.push(await sampleFallbackVisual(browser, sessionId));
        }

        if (scenario.waitMs > elapsedMs) {
            await delay(scenario.waitMs - elapsedMs);
        }

        return {
            ...(await evaluateState(browser, sessionId)),
            visualSamples,
        };
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
  window.__splashHarnessPlayCalls = [];

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

  if (mode !== "audio-reject" && mode !== "all-reject" && mode !== "stall" && mode !== "normal") {
    return;
  }

  const stopNativePlaybackForBlockedModes = (event) => {
    if (mode !== "all-reject" && mode !== "stall") {
      return;
    }

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
  document.addEventListener("play", stopNativePlaybackForBlockedModes, true);
  document.addEventListener("playing", stopNativePlaybackForBlockedModes, true);

  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function patchedPlay() {
    window.__splashHarnessPlayCalls.push({
      muted: Boolean(this.muted),
      defaultMuted: Boolean(this.defaultMuted),
      hasMutedAttribute: this.hasAttribute("muted"),
      controls: Boolean(this.controls),
      hasControlsAttribute: this.hasAttribute("controls"),
      playsInline: Boolean(this.playsInline),
      timestamp: performance.now(),
    });

    if (mode === "audio-reject" && !this.muted) {
      return Promise.reject(new DOMException("Harness blocked unmuted autoplay", "NotAllowedError"));
    }

    if (mode === "all-reject") {
      return Promise.reject(new DOMException("Harness blocked every play request", "NotAllowedError"));
    }

    if (mode === "stall") {
      return new Promise(() => {});
    }

    return originalPlay.apply(this, arguments);
  };
  HTMLMediaElement.prototype.play.__round13OriginalPlay = originalPlay;
})();
`;
}

async function evaluateState(browser, sessionId) {
    const expression = `(() => {
        const video = document.querySelector('[data-startup-splash-video="intro"]');
        const overlay = document.querySelector('[data-startup-splash="overlay"]');
        const appSurface = document.querySelector('[data-startup-splash-surface="app-fallback"]');
        const canvas = document.querySelector('[data-startup-splash-video-canvas="intro"]');
        const isVisible = (element) => {
            const styles = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return styles.display !== "none"
                && styles.visibility !== "hidden"
                && Number(styles.opacity || "1") > 0.01
                && rect.width > 1
                && rect.height > 1;
        };
        const overlayButtons = overlay
            ? Array.from(overlay.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"]'))
                .filter((element) => element instanceof HTMLElement && isVisible(element))
                .map((element) => ({
                    tagName: element.tagName,
                    text: element.textContent?.trim() ?? "",
                    ariaLabel: element.getAttribute("aria-label"),
                    role: element.getAttribute("role"),
                    dataStartupSplashStartAudio: element.getAttribute("data-startup-splash-start-audio"),
                }))
            : [];

        return {
            hasOverlay: Boolean(overlay),
            overlayStage: overlay?.getAttribute('data-startup-splash-stage') ?? null,
            hasAudioGate: Boolean(document.querySelector('[data-startup-splash-gate="audio"]')),
            hasStartButton: Boolean(document.querySelector('[data-startup-splash-start-audio="true"]')),
            overlayText: overlay?.innerText ?? "",
            overlayVisibleButtons: overlayButtons,
            hasVideo: Boolean(video),
            videoVisibleAttr: video?.getAttribute('data-startup-splash-video-visible') ?? null,
            nativeVideoVisible: (() => {
                if (!video) {
                    return false;
                }

                return isVisible(video);
            })(),
            videoMuted: video instanceof HTMLMediaElement ? video.muted : null,
            videoDefaultMuted: video instanceof HTMLMediaElement ? video.defaultMuted : null,
            videoHasMutedAttribute: video instanceof HTMLMediaElement ? video.hasAttribute("muted") : null,
            videoControls: video instanceof HTMLMediaElement ? video.controls : null,
            videoHasControlsAttribute: video instanceof HTMLMediaElement ? video.hasAttribute("controls") : null,
            videoPlaysInline: video instanceof HTMLVideoElement ? video.playsInline : null,
            videoDisablePictureInPicture: video instanceof HTMLVideoElement ? video.disablePictureInPicture : null,
            videoDisableRemotePlayback: video instanceof HTMLMediaElement ? video.disableRemotePlayback : null,
            hasVideoCanvas: Boolean(canvas),
            videoCanvasVisible: (() => {
                if (!canvas) {
                    return false;
                }

                return isVisible(canvas);
            })(),
            hasAppFallbackSurface: Boolean(appSurface),
            appFallbackSurfaceVisible: (() => {
                if (!appSurface) {
                    return false;
                }

                return isVisible(appSurface);
            })(),
            fallbackFrame: (() => {
                const frame = document.querySelector('[data-startup-splash-frame="mp4-derived"]');
                if (!frame) {
                    return null;
                }

                return {
                    index: Number(frame.getAttribute('data-startup-splash-frame-index')),
                    source: frame.getAttribute('data-startup-splash-fallback-source'),
                    sourceTimeMs: Number(frame.getAttribute('data-startup-splash-frame-source-time-ms')),
                    src: frame.currentSrc || frame.src,
                };
            })(),
            playCalls: window.__splashHarnessPlayCalls?.length ?? 0,
            playCallRecords: window.__splashHarnessPlayCalls ?? [],
            diagnostics: window.__round13StartupSplash ?? null,
            bodyText: document.body.innerText.slice(0, 200),
        };
    })()`;
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

async function waitForOverlay(browser, sessionId) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
        const result = await browser.send("Runtime.evaluate", {
            expression: `Boolean(document.querySelector('[data-startup-splash="overlay"]'))`,
            returnByValue: true,
        }, sessionId);

        if (result.result?.value === true) {
            return;
        }

        await delay(100);
    }

    throw new Error("Timed out waiting for startup splash overlay");
}

async function sampleFallbackVisual(browser, sessionId) {
    const expression = `(() => {
        const image = document.querySelector('[data-startup-splash-frame="mp4-derived"]');

        if (!(image instanceof HTMLImageElement)) {
            return { exists: false };
        }

        const styles = getComputedStyle(image);
        const rect = image.getBoundingClientRect();
        const visible = styles.display !== "none"
            && styles.visibility !== "hidden"
            && Number(styles.opacity || "1") > 0.01
            && rect.width > 1
            && rect.height > 1;

        if (!image.complete || image.naturalWidth < 1 || image.naturalHeight < 1) {
            return {
                exists: true,
                visible,
                loaded: false,
                frameIndex: Number(image.getAttribute('data-startup-splash-frame-index')),
                source: image.getAttribute('data-startup-splash-fallback-source'),
                src: image.currentSrc || image.src,
            };
        }

        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 18;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let hash = 2166136261;

        for (let index = 0; index < pixels.length; index += 1) {
            hash ^= pixels[index];
            hash = Math.imul(hash, 16777619);
        }

        return {
            exists: true,
            visible,
            loaded: true,
            frameIndex: Number(image.getAttribute('data-startup-splash-frame-index')),
            naturalHeight: image.naturalHeight,
            naturalWidth: image.naturalWidth,
            pixelHash: (hash >>> 0).toString(16).padStart(8, "0"),
            source: image.getAttribute('data-startup-splash-fallback-source'),
            sourceTimeMs: Number(image.getAttribute('data-startup-splash-frame-source-time-ms')),
            src: image.currentSrc || image.src,
        };
    })()`;
    const result = await browser.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
    }, sessionId);

    if (result.exceptionDetails) {
        throw new Error(`Fallback visual sampling failed: ${JSON.stringify(result.exceptionDetails)}`);
    }

    return result.result.value;
}

function assertNoManualStartSurface(state, context) {
    assert(!state?.hasAudioGate, `${context} must not render an app-controlled audio gate`);
    assert(!state?.hasStartButton, `${context} must not render a start-with-sound button`);
    assert(
        (state?.overlayVisibleButtons ?? []).length === 0,
        `${context} must not expose any visible splash CTA/button, got ${JSON.stringify(state?.overlayVisibleButtons ?? [])}`,
    );

    const overlayText = String(state?.overlayText ?? "").toLowerCase();
    const forbiddenText = ["начать со звуком", "начать", "запуск", "play", "start"];
    const matchedText = forbiddenText.find((text) => overlayText.includes(text));
    assert(!matchedText, `${context} must not expose start CTA text "${matchedText}" in overlay text "${state?.overlayText ?? ""}"`);

    assert(
        state?.diagnostics?.soundPolicy !== "awaiting-user-gesture-for-audio",
        `${context} must not diagnose a user-gesture audio gate`,
    );
}

function assertAutomaticUnmutedStart(state, context) {
    const firstCall = state.playCallRecords?.[0];

    assert(state.playCalls > 0, `${context} should call video.play() automatically without a gesture`);
    assert(firstCall, `${context} should record the first automatic video.play() call`);
    assert(firstCall.muted === false, `${context} first automatic play() call should be unmuted`);
    assert(firstCall.defaultMuted === false, `${context} first play() call should clear defaultMuted`);
    assert(firstCall.hasMutedAttribute === false, `${context} first play() call should remove the muted attribute`);
    assert(firstCall.controls === false, `${context} first play() call should keep native controls disabled`);
    assert(firstCall.hasControlsAttribute === false, `${context} first play() call should not add controls attribute`);
    assert(firstCall.playsInline === true, `${context} first play() call should keep playsInline enabled`);
    assert(
        state.diagnostics?.automaticStartRequested === true,
        `${context} should diagnose automatic startup, got ${describeState(state)}`,
    );
    assert(
        state.diagnostics?.unmutedPlayAttempts >= 1,
        `${context} should record an unmuted play attempt`,
    );
    assert(
        state.diagnostics?.unmutedAutoplayAttempts >= 1,
        `${context} should record an unmuted autoplay attempt`,
    );
}

function assertControlledFallbackSurface(state, context, options = {}) {
    const finalMayBeReleased = options.finalMayBeReleased === true && !state.hasOverlay;

    if (!finalMayBeReleased) {
        assert(state.hasAppFallbackSurface, `${context} should render the app-controlled fallback surface`);
        assert(state.appFallbackSurfaceVisible, `${context} fallback surface should be visible`);
        assert(
            state.diagnostics?.visibleSurface === "app-controlled-fallback",
            `${context} diagnostics should identify app-controlled fallback as the visible surface`,
        );
    }

    if (options.requireLongDuration) {
        assert(
            state.diagnostics?.controlledFallbackDurationMs >= 9_000,
            `${context} should expose a deterministic fallback duration at least as long as the 8s intro plus hold`,
        );
    }

    assert(
        state.diagnostics?.fallbackVisualSource === FALLBACK_VISUAL_SOURCE,
        `${context} should diagnose MP4-derived frame sequence fallback, got ${state.diagnostics?.fallbackVisualSource}`,
    );
    assert(
        state.diagnostics?.fallbackSourceSha256 === verifiedFallbackManifest?.sourceSha256,
        `${context} fallback source hash should match the verified MP4 manifest`,
    );
    assert(
        state.diagnostics?.fallbackFrameCount >= MIN_FALLBACK_FRAME_COUNT,
        `${context} should expose at least ${MIN_FALLBACK_FRAME_COUNT} fallback frames`,
    );

    if (!finalMayBeReleased) {
        assert(
            state.fallbackFrame?.source === FALLBACK_VISUAL_SOURCE,
            `${context} should render a MP4-derived fallback frame element`,
        );
    }
}

function assertNativeVideoSurface(state, context, { muted }) {
    assert(state.hasVideo, `${context} should keep the native video element mounted`);
    assert(state.nativeVideoVisible, `${context} should use the native video compositor as the visible surface`);
    assert(state.videoVisibleAttr === "true", `${context} should mark native video visible only after playing`);
    assert(state.videoMuted === muted, `${context} native video muted state should be ${muted}`);
    assert(state.videoControls === false, `${context} native controls must remain disabled`);
    assert(state.videoHasControlsAttribute === false, `${context} native controls attribute must not be present`);
    assert(state.videoPlaysInline === true, `${context} native video should play inline`);
    assert(state.videoDisablePictureInPicture === true, `${context} picture-in-picture should be disabled`);
    assert(state.videoDisableRemotePlayback === true, `${context} remote playback should be disabled`);
    assert(
        state.diagnostics?.visibleSurface === "native-video",
        `${context} diagnostics should identify native video as the visible surface`,
    );
}

function assertNoNativeManualPlaySurface(state, context, { allowNativeVisible }) {
    assert(state.videoControls !== true, `${context} must not enable native video controls`);
    assert(state.videoHasControlsAttribute !== true, `${context} must not render a native controls attribute`);

    if (!allowNativeVisible) {
        assert(!state.nativeVideoVisible, `${context} must not leave native video as the visible surface`);
        assert(
            state.videoVisibleAttr !== "true",
            `${context} must not mark native video visible before playback is proven or after fallback`,
        );
    }
}

function assertNoCanvasLoop(state, context) {
    assert(!state.hasVideoCanvas, `${context} should not render the old video-to-canvas surface`);
    assert(!state.videoCanvasVisible, `${context} should not show any video canvas`);
    assert(
        (state.diagnostics?.canvasDrawCount ?? 0) === 0,
        `${context} diagnostics should show no canvas draw loop`,
    );
    assert(
        state.diagnostics?.lastVideoCanvasTime === null,
        `${context} diagnostics should not publish video canvas frame time`,
    );
}

function assertFallbackVisualProgression(state, context) {
    const samples = state.visualSamples ?? [];

    assert(samples.length >= 2, `${context} should collect at least two fallback visual samples`);

    for (const sample of samples) {
        assert(sample.exists, `${context} fallback sample should find a rendered frame, sample=${JSON.stringify(sample)}`);
        assert(sample.visible, `${context} fallback frame should be visible during fallback, sample=${JSON.stringify(sample)}`);
        assert(sample.loaded, `${context} fallback frame should be loaded before sampling, sample=${JSON.stringify(sample)}`);
        assert(sample.source === FALLBACK_VISUAL_SOURCE, `${context} fallback sample should be MP4-derived`);
        assert(
            String(sample.src).includes(FALLBACK_FRAME_PUBLIC_PATH_PREFIX),
            `${context} fallback sample should use generated MP4 frame assets, got ${sample.src}`,
        );
        assert(
            sample.naturalWidth > 1 && sample.naturalHeight > 1,
            `${context} fallback frame should have image dimensions`,
        );
    }

    assert(
        new Set(samples.map((sample) => sample.frameIndex)).size > 1,
        `${context} fallback frame index should progress, samples=${JSON.stringify(samples)}`,
    );
    assert(
        new Set(samples.map((sample) => sample.pixelHash)).size > 1,
        `${context} fallback visual pixels should change; static fallback is not acceptable, samples=${JSON.stringify(samples)}`,
    );
}

function describeState(state) {
    return JSON.stringify({
        overlay: state.hasOverlay,
        overlayStage: state.overlayStage,
        hasAudioGate: state.hasAudioGate,
        hasStartButton: state.hasStartButton,
        overlayVisibleButtons: state.overlayVisibleButtons,
        playCalls: state.playCalls,
        playCallRecords: state.playCallRecords,
        nativeVideoVisible: state.nativeVideoVisible,
        videoMuted: state.videoMuted,
        videoControls: state.videoControls,
        appFallbackSurfaceVisible: state.appFallbackSurfaceVisible,
        fallbackFrame: state.fallbackFrame,
        visualSamples: state.visualSamples,
        diagnostics: {
            stage: state.diagnostics?.stage ?? null,
            lastEvent: state.diagnostics?.lastEvent ?? null,
            visibleSurface: state.diagnostics?.visibleSurface ?? null,
            automaticStartRequested: state.diagnostics?.automaticStartRequested ?? null,
            playAttempts: state.diagnostics?.playAttempts ?? null,
            unmutedPlayAttempts: state.diagnostics?.unmutedPlayAttempts ?? null,
            unmutedAutoplayAttempts: state.diagnostics?.unmutedAutoplayAttempts ?? null,
            mutedPlayAttempts: state.diagnostics?.mutedPlayAttempts ?? null,
            audioRejectedCount: state.diagnostics?.audioRejectedCount ?? null,
            playbackFallbackCount: state.diagnostics?.playbackFallbackCount ?? null,
            playbackFallbackReason: state.diagnostics?.playbackFallbackReason ?? null,
            fallbackVisualSource: state.diagnostics?.fallbackVisualSource ?? null,
            fallbackFrameIndex: state.diagnostics?.fallbackFrameIndex ?? null,
            soundPolicy: state.diagnostics?.soundPolicy ?? null,
            canvasDrawCount: state.diagnostics?.canvasDrawCount ?? null,
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
        `sound=${diagnostics.soundPolicy ?? "n/a"}`,
        `fallback=${diagnostics.fallbackVisualSource ?? "n/a"}`,
        `frame=${diagnostics.fallbackFrameIndex ?? "n/a"}`,
        `canvasDraws=${diagnostics.canvasDrawCount ?? 0}`,
        `automatic=${diagnostics.automaticStartRequested ?? false}`,
        `playAttempts=${diagnostics.playAttempts ?? 0}`,
        `unmuted=${diagnostics.unmutedPlayAttempts ?? 0}`,
        `unmutedAutoplay=${diagnostics.unmutedAutoplayAttempts ?? 0}`,
        `muted=${diagnostics.mutedPlayAttempts ?? 0}`,
        `audioRejects=${diagnostics.audioRejectedCount ?? 0}`,
        `fallbacks=${diagnostics.playbackFallbackCount ?? 0}`,
        `duration=${duration}`,
        `hold=${hold}`,
    ].join(" ");
}

async function loadAndVerifyStartupAssets(frontendRoot) {
    const manifestPath = publicPathToFilePath(frontendRoot, FALLBACK_MANIFEST_PUBLIC_PATH);
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const videoPath = publicPathToFilePath(frontendRoot, INTRO_VIDEO_PUBLIC_PATH);
    const videoBuffer = await readFile(videoPath);
    const videoHash = sha256(videoBuffer);
    const mp4Metadata = parseAndVerifyMp4(videoBuffer);

    assert(manifest.source === INTRO_VIDEO_PUBLIC_PATH, `fallback manifest should reference ${INTRO_VIDEO_PUBLIC_PATH}`);
    assert(
        manifest.sourceSha256 === videoHash,
        `fallback manifest source hash ${manifest.sourceSha256} does not match MP4 hash ${videoHash}`,
    );
    assert(
        manifest.durationMs >= 7_500 && manifest.durationMs <= 8_500,
        `fallback manifest should preserve the 8s MP4 duration, got ${manifest.durationMs}`,
    );
    assert(
        manifest.frameCount >= MIN_FALLBACK_FRAME_COUNT,
        `fallback manifest should include at least ${MIN_FALLBACK_FRAME_COUNT} frames`,
    );
    assert(
        Array.isArray(manifest.frames) && manifest.frames.length === manifest.frameCount,
        "fallback manifest frame list should match frameCount",
    );

    const frameHashes = new Set();

    for (const frame of manifest.frames) {
        assert(
            String(frame.src).startsWith(FALLBACK_FRAME_PUBLIC_PATH_PREFIX),
            `fallback frame should live under ${FALLBACK_FRAME_PUBLIC_PATH_PREFIX}, got ${frame.src}`,
        );

        const frameBuffer = await readFile(publicPathToFilePath(frontendRoot, frame.src));
        const frameHash = sha256(frameBuffer);

        assert(frameHash === frame.sha256, `fallback frame hash mismatch for ${frame.src}`);
        frameHashes.add(frameHash);
    }

    assert(
        frameHashes.size > 1,
        "fallback manifest frames are static duplicates; static fallback is not acceptable",
    );

    return { manifest, mp4Metadata };
}

function parseAndVerifyMp4(buffer) {
    const topLevelBoxes = readBoxes(buffer, 0, buffer.length);
    const moov = topLevelBoxes.find((box) => box.type === "moov");
    const mdat = topLevelBoxes.find((box) => box.type === "mdat");

    assert(moov, "MP4 should contain a moov box");
    assert(mdat, "MP4 should contain an mdat box");
    assert(moov.start < mdat.start, `MP4 should be fast-start: moov=${moov.start}, mdat=${mdat.start}`);

    const mvhd = findDescendants(buffer, moov, "mvhd")[0];
    assert(mvhd, "MP4 should contain mvhd movie metadata");
    const durationSeconds = readMovieDurationSeconds(buffer, mvhd);
    assert(
        durationSeconds >= 7.5 && durationSeconds <= 8.5,
        `MP4 duration should be near 8s, got ${durationSeconds.toFixed(3)}s`,
    );

    const trackHandlers = findDescendants(buffer, moov, "trak")
        .map((trak) => findDescendants(buffer, trak, "hdlr")[0])
        .filter(Boolean)
        .map((hdlr) => readHandlerType(buffer, hdlr));

    assert(trackHandlers.includes("vide"), `MP4 should contain a video track, handlers=${trackHandlers.join(",")}`);
    assert(trackHandlers.includes("soun"), `MP4 should contain an audio track, handlers=${trackHandlers.join(",")}`);

    return {
        durationSeconds,
        mdatOffset: mdat.start,
        moovOffset: moov.start,
        topLevelBoxes: topLevelBoxes.map((box) => box.type).join(","),
        trackHandlers,
    };
}

function formatMp4Guard(metadata) {
    return [
        "PASS mp4-metadata",
        `duration=${metadata.durationSeconds.toFixed(3)}s`,
        `moov=${metadata.moovOffset}`,
        `mdat=${metadata.mdatOffset}`,
        `tracks=${metadata.trackHandlers.join(",")}`,
        `boxes=${metadata.topLevelBoxes}`,
    ].join(" ");
}

function readBoxHeader(buffer, offset, limit = buffer.length) {
    if (offset + 8 > limit) {
        return null;
    }

    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    let headerSize = 8;

    if (size === 1) {
        if (offset + 16 > limit) {
            throw new Error(`Invalid large-size MP4 box ${type} at ${offset}`);
        }

        size = Number(buffer.readBigUInt64BE(offset + 8));
        headerSize = 16;
    } else if (size === 0) {
        size = limit - offset;
    }

    assert(size >= headerSize, `Invalid MP4 box ${type} at ${offset}: size ${size} < header ${headerSize}`);
    assert(offset + size <= limit, `Invalid MP4 box ${type} at ${offset}: size ${size} exceeds ${limit}`);

    return {
        end: offset + size,
        headerSize,
        size,
        start: offset,
        type,
    };
}

function readBoxes(buffer, start, end) {
    const boxes = [];
    let offset = start;

    while (offset + 8 <= end) {
        const box = readBoxHeader(buffer, offset, end);

        if (!box) {
            break;
        }

        boxes.push(box);
        offset = box.end;
    }

    assert(offset === end, `MP4 parser left unparsed bytes from ${offset} to ${end}`);

    return boxes;
}

const containerBoxes = new Set(["moov", "trak", "mdia", "minf", "stbl", "edts", "dinf", "udta"]);

function getChildBoxes(buffer, box) {
    if (!containerBoxes.has(box.type) && box.type !== "meta") {
        return [];
    }

    const childStart = box.start + box.headerSize + (box.type === "meta" ? 4 : 0);
    return readBoxes(buffer, childStart, box.end);
}

function findDescendants(buffer, rootBox, type) {
    const matches = [];

    function visit(box) {
        if (box.type === type) {
            matches.push(box);
        }

        for (const child of getChildBoxes(buffer, box)) {
            visit(child);
        }
    }

    visit(rootBox);
    return matches;
}

function readMovieDurationSeconds(buffer, mvhd) {
    const version = buffer[mvhd.start + mvhd.headerSize];

    if (version === 1) {
        const timescale = buffer.readUInt32BE(mvhd.start + mvhd.headerSize + 20);
        const duration = Number(buffer.readBigUInt64BE(mvhd.start + mvhd.headerSize + 24));
        return duration / timescale;
    }

    const timescale = buffer.readUInt32BE(mvhd.start + mvhd.headerSize + 12);
    const duration = buffer.readUInt32BE(mvhd.start + mvhd.headerSize + 16);
    return duration / timescale;
}

function readHandlerType(buffer, hdlr) {
    return buffer.toString("ascii", hdlr.start + hdlr.headerSize + 8, hdlr.start + hdlr.headerSize + 12);
}

function publicPathToFilePath(frontendRoot, publicPath) {
    return path.join(frontendRoot, "public", publicPath.replace(/^\//, ""));
}

function sha256(buffer) {
    return createHash("sha256").update(buffer).digest("hex");
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
