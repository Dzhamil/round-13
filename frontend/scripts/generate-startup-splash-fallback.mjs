import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { access, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const FRAME_COUNT = 32;
const MAX_FRAME_WIDTH = 540;
const WEBP_QUALITY = 0.74;
const STARTUP_VIDEO_PUBLIC_PATH = "/videos/round13-startup-intro.mp4";
const OUTPUT_PUBLIC_DIR = "/generated/startup-splash-fallback";
const OUTPUT_FILE_PREFIX = "frame";
const CHROME_STARTUP_TIMEOUT_MS = 15_000;
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

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function main() {
    const frontendRoot = process.cwd();
    const publicRoot = path.join(frontendRoot, "public");
    const videoPath = path.join(publicRoot, STARTUP_VIDEO_PUBLIC_PATH);
    const outputDirectory = path.join(publicRoot, OUTPUT_PUBLIC_DIR);
    const modulePath = path.join(frontendRoot, "src", "app", "startupSplashFallbackFrames.ts");
    const serverPort = await getFreePort();
    const chromePort = await getFreePort();
    const server = await startStaticServer(publicRoot, serverPort);
    const chromeUserDataDir = path.join(os.tmpdir(), `round13-splash-framegen-${process.pid}`);
    const chrome = spawnManaged(await findChrome(), [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--autoplay-policy=no-user-gesture-required",
        `--remote-debugging-port=${chromePort}`,
        `--user-data-dir=${chromeUserDataDir}`,
        "about:blank",
    ]);
    const generatorUrl = `http://127.0.0.1:${serverPort}/__startup_splash_framegen.html`;

    try {
        const browser = await connectToBrowser(chromePort);

        try {
            const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
            const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
            const sourceSha256 = await hashFile(videoPath);

            try {
                await browser.send("Page.enable", {}, sessionId);
                await browser.send("Runtime.enable", {}, sessionId);
                await browser.send("Page.navigate", { url: generatorUrl }, sessionId);
                await waitForPageReady(browser, sessionId, generatorUrl);

                const extraction = await extractFrames(browser, sessionId, {
                    frameCount: FRAME_COUNT,
                    maxFrameWidth: MAX_FRAME_WIDTH,
                    quality: WEBP_QUALITY,
                    videoSrc: `http://127.0.0.1:${serverPort}${STARTUP_VIDEO_PUBLIC_PATH}`,
                });

                await writeGeneratedAssets({
                    extraction,
                    modulePath,
                    outputDirectory,
                    sourceSha256,
                });
                console.log(
                    `Generated ${extraction.frames.length} MP4-derived fallback frames at ${path.relative(frontendRoot, outputDirectory)}`,
                );
            } finally {
                await browser.send("Target.closeTarget", { targetId }).catch(() => undefined);
            }
        } finally {
            await browser.close();
        }
    } finally {
        server.close();
        await once(server, "close").catch(() => undefined);
        await terminateProcess(chrome);
        await rm(chromeUserDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    }
}

async function startStaticServer(publicRoot, port) {
    const server = http.createServer(async (req, res) => {
        try {
            const requestUrl = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);

            if (requestUrl.pathname === "/__startup_splash_framegen.html") {
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end("<!doctype html><html><body></body></html>");
                return;
            }

            const filePath = path.resolve(publicRoot, `.${decodeURIComponent(requestUrl.pathname)}`);
            const relativePath = path.relative(publicRoot, filePath);

            if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
                res.writeHead(403);
                res.end("Forbidden");
                return;
            }

            const file = await readFile(filePath);
            res.writeHead(200, { "content-type": getContentType(filePath) });
            res.end(file);
        } catch (error) {
            res.writeHead(error?.code === "ENOENT" ? 404 : 500);
            res.end(error?.message ?? "Server error");
        }
    });

    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, "127.0.0.1", () => {
            server.off("error", reject);
            resolve();
        });
    });

    return server;
}

async function extractFrames(browser, sessionId, options) {
    const expression = `(${extractFramesInBrowser.toString()})(${JSON.stringify(options)})`;
    const result = await browser.send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
    }, sessionId);

    if (result.exceptionDetails) {
        throw new Error(`Frame extraction failed: ${JSON.stringify(result.exceptionDetails)}`);
    }

    return result.result.value;
}

async function waitForPageReady(browser, sessionId, expectedUrl) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < CHROME_STARTUP_TIMEOUT_MS) {
        const result = await browser.send("Runtime.evaluate", {
            expression: `document.readyState === "complete" && location.href === ${JSON.stringify(expectedUrl)}`,
            returnByValue: true,
        }, sessionId);

        if (result.result?.value === true) {
            return;
        }

        await delay(100);
    }

    throw new Error(`Timed out waiting for generator page ${expectedUrl}`);
}

async function writeGeneratedAssets({ extraction, modulePath, outputDirectory, sourceSha256 }) {
    await rm(outputDirectory, { recursive: true, force: true });
    await mkdir(outputDirectory, { recursive: true });

    const frames = [];

    for (const frame of extraction.frames) {
        const filename = `${OUTPUT_FILE_PREFIX}-${String(frame.index).padStart(3, "0")}.webp`;
        const outputPath = path.join(outputDirectory, filename);
        const buffer = dataUrlToBuffer(frame.dataUrl);

        await writeFile(outputPath, buffer);

        frames.push({
            bytes: (await stat(outputPath)).size,
            index: frame.index,
            sha256: sha256(buffer),
            sourceTimeMs: frame.sourceTimeMs,
            src: `${OUTPUT_PUBLIC_DIR}/${filename}`,
        });
    }

    const manifest = {
        version: 1,
        source: STARTUP_VIDEO_PUBLIC_PATH,
        sourceSha256,
        generatedBy: "scripts/generate-startup-splash-fallback.mjs",
        frameFormat: "image/webp",
        frameCount: frames.length,
        frameIntervalMs: Math.round(extraction.durationMs / frames.length),
        frameWidth: extraction.frameWidth,
        frameHeight: extraction.frameHeight,
        sourceVideoWidth: extraction.videoWidth,
        sourceVideoHeight: extraction.videoHeight,
        durationMs: extraction.durationMs,
        frames,
    };

    await writeFile(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    await writeFile(modulePath, formatFrameModule(manifest));
}

function formatFrameModule(manifest) {
    const frames = manifest.frames.map((frame) => ({
        index: frame.index,
        sourceTimeMs: frame.sourceTimeMs,
        src: frame.src,
    }));

    return `// Generated by ${manifest.generatedBy} from ${manifest.source}.\n`
        + "// Do not hand-edit; run npm run generate:splash-fallback.\n\n"
        + "export type StartupSplashFallbackFrame = {\n"
        + "    readonly index: number;\n"
        + "    readonly sourceTimeMs: number;\n"
        + "    readonly src: string;\n"
        + "};\n\n"
        + `export const STARTUP_SPLASH_FALLBACK_SOURCE_SHA256 = ${JSON.stringify(manifest.sourceSha256)};\n`
        + `export const STARTUP_SPLASH_FALLBACK_DURATION_MS = ${manifest.durationMs};\n`
        + `export const STARTUP_SPLASH_FALLBACK_FRAME_WIDTH = ${manifest.frameWidth};\n`
        + `export const STARTUP_SPLASH_FALLBACK_FRAME_HEIGHT = ${manifest.frameHeight};\n`
        + `export const STARTUP_SPLASH_FALLBACK_FRAMES = ${JSON.stringify(frames, null, 4)} as const satisfies readonly StartupSplashFallbackFrame[];\n`;
}

function dataUrlToBuffer(dataUrl) {
    const [, base64] = dataUrl.split(",");

    if (!base64) {
        throw new Error("Browser returned an invalid frame data URL");
    }

    return Buffer.from(base64, "base64");
}

function extractFramesInBrowser({ frameCount, maxFrameWidth, quality, videoSrc }) {
    const waitForDecodedFrame = (video) => new Promise((resolve) => {
        let isResolved = false;
        const resolveOnce = () => {
            if (isResolved) {
                return;
            }

            isResolved = true;
            resolve();
        };

        if (typeof video.requestVideoFrameCallback === "function") {
            video.requestVideoFrameCallback(() => {
                resolveOnce();
            });
        }

        setTimeout(resolveOnce, 250);
        requestAnimationFrame(() => {
            requestAnimationFrame(resolveOnce);
        });
    });

    const loadMetadata = (video) => new Promise((resolve, reject) => {
        const cleanup = () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("error", handleError);
        };
        const handleLoadedMetadata = () => {
            cleanup();
            resolve();
        };
        const handleError = () => {
            cleanup();
            reject(new Error("Video metadata failed to load"));
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
        video.addEventListener("error", handleError, { once: true });
        video.src = videoSrc;
        video.load();
    });

    const makeEven = (value) => Math.max(2, Math.round(value / 2) * 2);
    const waitForPlaybackTime = (video, targetSeconds) => new Promise((resolve, reject) => {
        const startedAt = performance.now();
        const timeoutMs = Math.max(2_000, (targetSeconds - video.currentTime) * 1_000 + 2_000);
        const timer = setInterval(() => {
            if (video.currentTime >= targetSeconds || video.ended) {
                clearInterval(timer);
                resolve();
                return;
            }

            if (performance.now() - startedAt > timeoutMs) {
                clearInterval(timer);
                reject(new Error(`Timed out waiting for playback time ${targetSeconds}s`));
            }
        }, 20);
    });

    return (async () => {
        const video = document.createElement("video");
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.preload = "auto";
        document.body.append(video);

        await loadMetadata(video);

        const scale = Math.min(1, maxFrameWidth / video.videoWidth);
        const frameWidth = makeEven(video.videoWidth * scale);
        const frameHeight = makeEven(video.videoHeight * scale);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: false });
        const maxTime = Math.max(0, video.duration - 0.08);
        const frames = [];

        canvas.width = frameWidth;
        canvas.height = frameHeight;

        await video.play();

        for (let index = 0; index < frameCount; index += 1) {
            const progress = frameCount === 1 ? 0 : index / (frameCount - 1);
            const sourceTimeSeconds = maxTime * progress;

            await waitForPlaybackTime(video, sourceTimeSeconds);
            await waitForDecodedFrame(video);
            context.fillStyle = "#000";
            context.fillRect(0, 0, frameWidth, frameHeight);
            context.drawImage(video, 0, 0, frameWidth, frameHeight);
            frames.push({
                dataUrl: canvas.toDataURL("image/webp", quality),
                index,
                sourceTimeMs: Math.round(sourceTimeSeconds * 1000),
            });
        }

        video.pause();

        return {
            durationMs: Math.round(video.duration * 1000),
            frameHeight,
            frameWidth,
            frames,
            videoHeight: video.videoHeight,
            videoWidth: video.videoWidth,
        };
    })();
}

function sha256(buffer) {
    return createHash("sha256").update(buffer).digest("hex");
}

async function hashFile(filePath) {
    return sha256(await readFile(filePath));
}

function getContentType(filePath) {
    if (filePath.endsWith(".mp4")) {
        return "video/mp4";
    }

    if (filePath.endsWith(".webp")) {
        return "image/webp";
    }

    return "application/octet-stream";
}

async function connectToBrowser(port) {
    const versionUrl = `http://127.0.0.1:${port}/json/version`;
    const version = await waitForJson(versionUrl, CHROME_STARTUP_TIMEOUT_MS);
    const client = new CdpClient(version.webSocketDebuggerUrl);
    await client.open();
    return client;
}

class CdpClient {
    constructor(webSocketUrl) {
        this.nextId = 1;
        this.pending = new Map();
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
        const pending = this.pending.get(message.id);

        if (!pending) {
            return;
        }

        this.pending.delete(message.id);

        if (message.error) {
            pending.reject(new Error(`${message.error.message}: ${JSON.stringify(message.error.data ?? {})}`));
            return;
        }

        pending.resolve(message.result ?? {});
    }

    cleanupTransport() {
        this.webSocket.removeEventListener("message", this.handleMessageBound);
        this.webSocket.removeEventListener("error", this.handleTransportClosedBound);
        this.webSocket.removeEventListener("close", this.handleTransportClosedBound);
        this.rejectPending(new Error("CDP connection closed"));
    }

    rejectPending(error) {
        if (this.isClosing) {
            this.pending.clear();
            return;
        }

        for (const pending of this.pending.values()) {
            pending.reject(error);
        }

        this.pending.clear();
    }
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

function request(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
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

    throw new Error("Chrome executable was not found. Set CHROME_PATH to generate fallback frames.");
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
