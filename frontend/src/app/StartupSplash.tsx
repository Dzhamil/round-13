import { PropsWithChildren, RefObject, useCallback, useEffect, useRef, useState } from "react";

import {
    STARTUP_SPLASH_FALLBACK_DURATION_MS,
    STARTUP_SPLASH_FALLBACK_FRAME_HEIGHT,
    STARTUP_SPLASH_FALLBACK_FRAME_WIDTH,
    STARTUP_SPLASH_FALLBACK_FRAMES,
    STARTUP_SPLASH_FALLBACK_SOURCE_SHA256,
    StartupSplashFallbackFrame,
} from "./startupSplashFallbackFrames";
import styles from "./StartupSplash.module.css";

const INTRO_VIDEO_SRC = "/videos/round13-startup-intro.mp4";
const POST_ENDED_HOLD_MS = 1_000;
const CONTROLLED_FALLBACK_DURATION_MS = STARTUP_SPLASH_FALLBACK_DURATION_MS;
const FALLBACK_POSTER_DURATION_MS = 1_000;
const AUTOPLAY_FALLBACK_DELAY_MS = 2_500;
const MAX_CANVAS_DEVICE_PIXEL_RATIO = 2;

type SplashStage = "video" | "autoplay-fallback" | "reduced-motion-fallback" | "media-error-fallback" | "complete";
type ReleaseReason = "video-ended" | "autoplay-fallback" | "reduced-motion" | "media-error";
type VisibleSurface = "app-controlled-video" | "app-controlled-fallback" | "none";
type FallbackVisualSource = "mp4-frame-sequence";

type StartupSplashDiagnostics = {
    stage: SplashStage;
    releaseReason: ReleaseReason | null;
    visibleSurface: VisibleSurface;
    lastEvent: string;
    playAttempts: number;
    autoplayBlockedCount: number;
    autoplayFallbackCount: number;
    autoplayFallbackReason: string | null;
    controlledFallbackDurationMs: number | null;
    fallbackVisualSource: FallbackVisualSource;
    fallbackSourceSha256: string;
    fallbackFrameCount: number;
    fallbackFrameIndex: number | null;
    fallbackFrameSrc: string | null;
    fallbackFrameSourceTimeMs: number | null;
    lastVideoCanvasTime: number | null;
    soundPolicy: string;
    readyState: number | null;
    networkState: number | null;
    duration: number | null;
    currentTime: number | null;
    paused: boolean | null;
    ended: boolean | null;
    mediaError: string | null;
    lastPlayError: string | null;
    endedAt: number | null;
    completedAt: number | null;
    updatedAt: number;
};

declare global {
    interface Window {
        __round13StartupSplash?: StartupSplashDiagnostics;
    }
}

function shouldUseReducedMotion(): boolean {
    return typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function configureInlineAutoplayVideo(video: HTMLVideoElement): void {
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    video.controls = false;

    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("preload", "auto");
    video.removeAttribute("controls");
}

function getMediaError(video: HTMLVideoElement | null): string | null {
    const mediaError = video?.error;

    if (!mediaError) {
        return null;
    }

    const errorNames: Record<number, string> = {
        1: "aborted",
        2: "network",
        3: "decode",
        4: "src-not-supported",
    };

    return errorNames[mediaError.code] ?? `unknown-${mediaError.code}`;
}

function getErrorName(error: unknown): string {
    if (error instanceof DOMException) {
        return error.name;
    }

    if (error instanceof Error) {
        return error.name || error.message;
    }

    return String(error);
}

function getDiagnosticsTime(): number {
    return typeof performance === "undefined" ? Date.now() : performance.now();
}

function getFallbackFrameIndex(elapsedMs: number): number {
    const frameCount = STARTUP_SPLASH_FALLBACK_FRAMES.length;
    const clampedElapsedMs = Math.min(Math.max(elapsedMs, 0), CONTROLLED_FALLBACK_DURATION_MS - 1);
    const progress = clampedElapsedMs / CONTROLLED_FALLBACK_DURATION_MS;

    return Math.min(frameCount - 1, Math.floor(progress * frameCount));
}

function drawContainedSource(
    canvas: HTMLCanvasElement,
    source: CanvasImageSource,
    sourceWidth: number,
    sourceHeight: number,
): boolean {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DEVICE_PIXEL_RATIO);
    const canvasWidth = Math.max(1, Math.round(rect.width * pixelRatio));
    const canvasHeight = Math.max(1, Math.round(rect.height * pixelRatio));
    const context = canvas.getContext("2d");

    if (!context || sourceWidth <= 0 || sourceHeight <= 0) {
        return false;
    }

    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }

    const scale = Math.min(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const drawX = (canvasWidth - drawWidth) / 2;
    const drawY = (canvasHeight - drawHeight) / 2;

    context.fillStyle = "#000";
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(source, drawX, drawY, drawWidth, drawHeight);

    return true;
}

type FallbackVisualProps = {
    animated: boolean;
    hidden: boolean;
    onFrameChange: (frame: StartupSplashFallbackFrame) => void;
    splashStartedAtMs: number;
};

function StartupSplashFallbackVisual({
    animated,
    hidden,
    onFrameChange,
    splashStartedAtMs,
}: FallbackVisualProps) {
    const [frameIndex, setFrameIndex] = useState(() => (
        animated ? getFallbackFrameIndex(getDiagnosticsTime() - splashStartedAtMs) : 0
    ));

    useEffect(() => {
        if (!animated) {
            setFrameIndex(0);
            return undefined;
        }

        let animationFrame = 0;
        const updateFrame = () => {
            const elapsedMs = getDiagnosticsTime() - splashStartedAtMs;
            const nextFrameIndex = getFallbackFrameIndex(elapsedMs);

            setFrameIndex((currentFrameIndex) => (
                currentFrameIndex === nextFrameIndex ? currentFrameIndex : nextFrameIndex
            ));

            if (elapsedMs < CONTROLLED_FALLBACK_DURATION_MS) {
                animationFrame = window.requestAnimationFrame(updateFrame);
            }
        };

        updateFrame();

        return () => {
            window.cancelAnimationFrame(animationFrame);
        };
    }, [animated, splashStartedAtMs]);

    const frame = STARTUP_SPLASH_FALLBACK_FRAMES[frameIndex] ?? STARTUP_SPLASH_FALLBACK_FRAMES[0];

    useEffect(() => {
        onFrameChange(frame);
    }, [frame, onFrameChange]);

    return (
        <img
            className={`${styles.fallbackFrame} ${hidden ? styles.fallbackFrameHidden : ""}`}
            src={frame.src}
            width={STARTUP_SPLASH_FALLBACK_FRAME_WIDTH}
            height={STARTUP_SPLASH_FALLBACK_FRAME_HEIGHT}
            alt=""
            decoding="async"
            draggable={false}
            data-startup-splash-frame="mp4-derived"
            data-startup-splash-frame-index={frame.index}
            data-startup-splash-frame-source-time-ms={frame.sourceTimeMs}
            data-startup-splash-fallback-source="mp4-frame-sequence"
        />
    );
}

type VideoCanvasProps = {
    active: boolean;
    onFrameDrawn: (currentTime: number) => void;
    videoRef: RefObject<HTMLVideoElement>;
};

function StartupSplashVideoCanvas({ active, onFrameDrawn, videoRef }: VideoCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!active) {
            return undefined;
        }

        let animationFrame = 0;
        let lastPublishedAt = 0;
        const drawFrame = () => {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            if (canvas && video && video.videoWidth > 0 && video.videoHeight > 0) {
                const didDraw = drawContainedSource(canvas, video, video.videoWidth, video.videoHeight);
                const now = getDiagnosticsTime();

                if (didDraw && now - lastPublishedAt >= 250) {
                    lastPublishedAt = now;
                    onFrameDrawn(video.currentTime);
                }
            }

            animationFrame = window.requestAnimationFrame(drawFrame);
        };

        drawFrame();

        return () => {
            window.cancelAnimationFrame(animationFrame);
        };
    }, [active, onFrameDrawn, videoRef]);

    return (
        <canvas
            ref={canvasRef}
            className={`${styles.videoCanvas} ${active ? styles.videoCanvasActive : styles.videoCanvasHidden}`}
            data-startup-splash-video-canvas="intro"
            data-startup-splash-video-canvas-active={active ? "true" : "false"}
        />
    );
}

export function StartupSplash({ children }: PropsWithChildren) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const completionTimerRef = useRef<number | null>(null);
    const autoplayFallbackTimerRef = useRef<number | null>(null);
    const isCompleteRef = useRef(false);
    const splashStartedAtRef = useRef(getDiagnosticsTime());
    const stageRef = useRef<SplashStage>("video");
    const diagnosticsRef = useRef<StartupSplashDiagnostics>({
        stage: "video",
        releaseReason: null,
        visibleSurface: "app-controlled-fallback",
        lastEvent: "init",
        playAttempts: 0,
        autoplayBlockedCount: 0,
        autoplayFallbackCount: 0,
        autoplayFallbackReason: null,
        controlledFallbackDurationMs: null,
        fallbackVisualSource: "mp4-frame-sequence",
        fallbackSourceSha256: STARTUP_SPLASH_FALLBACK_SOURCE_SHA256,
        fallbackFrameCount: STARTUP_SPLASH_FALLBACK_FRAMES.length,
        fallbackFrameIndex: null,
        fallbackFrameSrc: null,
        fallbackFrameSourceTimeMs: null,
        lastVideoCanvasTime: null,
        soundPolicy: "visual-intro-muted-autoplay; sound-autoplay-not-required",
        readyState: null,
        networkState: null,
        duration: null,
        currentTime: null,
        paused: null,
        ended: null,
        mediaError: null,
        lastPlayError: null,
        endedAt: null,
        completedAt: null,
        updatedAt: Date.now(),
    });
    const [stage, setStage] = useState<SplashStage>(() => (
        shouldUseReducedMotion() ? "reduced-motion-fallback" : "video"
    ));
    const [isVideoCanvasActive, setIsVideoCanvasActive] = useState(false);
    const isVideoCanvasActiveRef = useRef(false);

    const setVideoCanvasActive = useCallback((isActive: boolean) => {
        isVideoCanvasActiveRef.current = isActive;
        setIsVideoCanvasActive(isActive);
    }, []);

    const publishDiagnostics = useCallback((patch: Partial<StartupSplashDiagnostics>) => {
        const video = videoRef.current;
        const nextDiagnostics: StartupSplashDiagnostics = {
            ...diagnosticsRef.current,
            ...patch,
            stage: patch.stage ?? stageRef.current,
            visibleSurface: patch.visibleSurface ?? diagnosticsRef.current.visibleSurface,
            readyState: video?.readyState ?? diagnosticsRef.current.readyState,
            networkState: video?.networkState ?? diagnosticsRef.current.networkState,
            duration: Number.isFinite(video?.duration) ? video?.duration ?? null : diagnosticsRef.current.duration,
            currentTime: video?.currentTime ?? diagnosticsRef.current.currentTime,
            paused: video?.paused ?? diagnosticsRef.current.paused,
            ended: video?.ended ?? diagnosticsRef.current.ended,
            mediaError: patch.mediaError ?? getMediaError(video) ?? diagnosticsRef.current.mediaError,
            updatedAt: Date.now(),
        };

        diagnosticsRef.current = nextDiagnostics;
        window.__round13StartupSplash = nextDiagnostics;
    }, []);

    const clearCompletionTimer = useCallback(() => {
        if (completionTimerRef.current === null) {
            return;
        }

        window.clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
    }, []);

    const clearAutoplayFallbackTimer = useCallback(() => {
        if (autoplayFallbackTimerRef.current === null) {
            return;
        }

        window.clearTimeout(autoplayFallbackTimerRef.current);
        autoplayFallbackTimerRef.current = null;
    }, []);

    const completeSplash = useCallback((releaseReason: ReleaseReason) => {
        if (isCompleteRef.current) {
            return;
        }

        isCompleteRef.current = true;
        clearCompletionTimer();
        clearAutoplayFallbackTimer();
        stageRef.current = "complete";
        videoRef.current?.pause();
        setVideoCanvasActive(false);
        publishDiagnostics({
            completedAt: getDiagnosticsTime(),
            lastEvent: `complete:${releaseReason}`,
            releaseReason,
            stage: "complete",
            visibleSurface: "none",
        });
        setStage("complete");
    }, [clearAutoplayFallbackTimer, clearCompletionTimer, publishDiagnostics, setVideoCanvasActive]);

    const showAutoplayFallback = useCallback((reason: string) => {
        if (isCompleteRef.current || stageRef.current !== "video") {
            return;
        }

        clearCompletionTimer();
        clearAutoplayFallbackTimer();
        stageRef.current = "autoplay-fallback";
        diagnosticsRef.current.autoplayFallbackCount += 1;
        videoRef.current?.pause();
        setVideoCanvasActive(false);
        publishDiagnostics({
            autoplayFallbackReason: reason,
            controlledFallbackDurationMs: CONTROLLED_FALLBACK_DURATION_MS + POST_ENDED_HOLD_MS,
            lastEvent: `autoplay-fallback:${reason}`,
            stage: "autoplay-fallback",
            visibleSurface: "app-controlled-fallback",
        });
        setStage("autoplay-fallback");
    }, [clearAutoplayFallbackTimer, clearCompletionTimer, publishDiagnostics, setVideoCanvasActive]);

    const showMediaErrorFallback = useCallback(() => {
        if (isCompleteRef.current) {
            return;
        }

        clearCompletionTimer();
        clearAutoplayFallbackTimer();
        stageRef.current = "media-error-fallback";
        videoRef.current?.pause();
        setVideoCanvasActive(false);
        publishDiagnostics({
            controlledFallbackDurationMs: FALLBACK_POSTER_DURATION_MS,
            lastEvent: "media-error-fallback",
            mediaError: getMediaError(videoRef.current) ?? "error-event",
            stage: "media-error-fallback",
            visibleSurface: "app-controlled-fallback",
        });
        setStage("media-error-fallback");
    }, [clearAutoplayFallbackTimer, clearCompletionTimer, publishDiagnostics, setVideoCanvasActive]);

    const scheduleAutoplayFallback = useCallback((trigger: string, delayMs = AUTOPLAY_FALLBACK_DELAY_MS) => {
        if (stageRef.current !== "video" || isCompleteRef.current) {
            return;
        }

        if (autoplayFallbackTimerRef.current !== null) {
            publishDiagnostics({ lastEvent: `autoplay-fallback-already-scheduled:${trigger}` });
            return;
        }

        publishDiagnostics({ lastEvent: `autoplay-fallback-scheduled:${trigger}` });
        autoplayFallbackTimerRef.current = window.setTimeout(() => {
            showAutoplayFallback(trigger);
        }, delayMs);
    }, [publishDiagnostics, showAutoplayFallback]);

    const requestPlayback = useCallback((trigger: string) => {
        const video = videoRef.current;

        if (!video || stageRef.current !== "video" || isCompleteRef.current || video.ended) {
            return;
        }

        configureInlineAutoplayVideo(video);
        diagnosticsRef.current.playAttempts += 1;
        publishDiagnostics({
            lastEvent: `play-attempt:${trigger}`,
            visibleSurface: isVideoCanvasActiveRef.current ? "app-controlled-video" : "app-controlled-fallback",
        });

        const playback = video.play();
        scheduleAutoplayFallback("play-pending");

        if (playback === undefined) {
            return;
        }

        void playback.then(() => {
            if (videoRef.current === video && !video.paused && !video.ended) {
                clearAutoplayFallbackTimer();
                setVideoCanvasActive(true);
            }

            publishDiagnostics({
                lastEvent: `play-resolved:${trigger}`,
                visibleSurface: isVideoCanvasActiveRef.current ? "app-controlled-video" : "app-controlled-fallback",
            });
        }).catch((error: unknown) => {
            if (videoRef.current !== video || isCompleteRef.current || stageRef.current !== "video") {
                return;
            }

            diagnosticsRef.current.autoplayBlockedCount += 1;
            publishDiagnostics({
                lastEvent: `autoplay-blocked:${trigger}`,
                lastPlayError: getErrorName(error),
            });

            showAutoplayFallback("play-rejected");
        });
    }, [clearAutoplayFallbackTimer, publishDiagnostics, scheduleAutoplayFallback, setVideoCanvasActive, showAutoplayFallback]);

    const handleFallbackFrameChange = useCallback((frame: StartupSplashFallbackFrame) => {
        publishDiagnostics({
            fallbackFrameIndex: frame.index,
            fallbackFrameSourceTimeMs: frame.sourceTimeMs,
            fallbackFrameSrc: frame.src,
            fallbackVisualSource: "mp4-frame-sequence",
        });
    }, [publishDiagnostics]);

    const handleVideoCanvasFrameDrawn = useCallback((currentTime: number) => {
        publishDiagnostics({
            lastVideoCanvasTime: currentTime,
            visibleSurface: "app-controlled-video",
        });
    }, [publishDiagnostics]);

    useEffect(() => {
        stageRef.current = stage;
        publishDiagnostics({ stage, lastEvent: `stage:${stage}` });
    }, [publishDiagnostics, stage]);

    useEffect(() => {
        if (stage !== "video") {
            return undefined;
        }

        requestPlayback("mount");
        return clearAutoplayFallbackTimer;
    }, [clearAutoplayFallbackTimer, requestPlayback, stage]);

    useEffect(() => {
        if (
            stage !== "autoplay-fallback"
            && stage !== "reduced-motion-fallback"
            && stage !== "media-error-fallback"
        ) {
            return undefined;
        }

        const releaseReason: ReleaseReason = {
            "autoplay-fallback": "autoplay-fallback",
            "reduced-motion-fallback": "reduced-motion",
            "media-error-fallback": "media-error",
        }[stage];
        const fallbackDurationMs = stage === "autoplay-fallback"
            ? Math.max(
                POST_ENDED_HOLD_MS,
                CONTROLLED_FALLBACK_DURATION_MS + POST_ENDED_HOLD_MS - (getDiagnosticsTime() - splashStartedAtRef.current),
            )
            : FALLBACK_POSTER_DURATION_MS;

        completionTimerRef.current = window.setTimeout(() => {
            completeSplash(releaseReason);
        }, fallbackDurationMs);

        return clearCompletionTimer;
    }, [clearCompletionTimer, completeSplash, stage]);

    useEffect(() => () => {
        clearCompletionTimer();
        clearAutoplayFallbackTimer();
    }, [clearAutoplayFallbackTimer, clearCompletionTimer]);

    const scheduleCompletionAfterEnded = useCallback(() => {
        if (isCompleteRef.current) {
            return;
        }

        clearAutoplayFallbackTimer();
        clearCompletionTimer();
        publishDiagnostics({
            endedAt: getDiagnosticsTime(),
            lastEvent: "ended-hold",
        });
        completionTimerRef.current = window.setTimeout(() => {
            completeSplash("video-ended");
        }, POST_ENDED_HOLD_MS);
    }, [clearAutoplayFallbackTimer, clearCompletionTimer, completeSplash, publishDiagnostics]);

    if (stage === "complete") {
        return <>{children}</>;
    }

    return (
        <div
            className={styles.overlay}
            aria-hidden="true"
            data-startup-splash="overlay"
            data-startup-splash-stage={stage}
            onPointerDown={() => requestPlayback("pointer")}
        >
            <div
                className={styles.appVisualSurface}
                data-startup-splash-surface="app-fallback"
                data-startup-splash-visible-surface={isVideoCanvasActive ? "app-controlled-video" : "app-controlled-fallback"}
            >
                <StartupSplashFallbackVisual
                    animated={stage !== "reduced-motion-fallback"}
                    hidden={isVideoCanvasActive}
                    onFrameChange={handleFallbackFrameChange}
                    splashStartedAtMs={splashStartedAtRef.current}
                />
                <StartupSplashVideoCanvas
                    active={stage === "video" && isVideoCanvasActive}
                    onFrameDrawn={handleVideoCanvasFrameDrawn}
                    videoRef={videoRef}
                />
            </div>
            {stage === "video" && (
                <video
                    ref={videoRef}
                    className={styles.nativeVideo}
                    src={INTRO_VIDEO_SRC}
                    data-startup-splash-video="intro"
                    data-startup-splash-video-visible="false"
                    autoPlay
                    muted
                    defaultMuted
                    playsInline
                    preload="auto"
                    controls={false}
                    controlsList="nodownload noplaybackrate noremoteplayback"
                    disablePictureInPicture
                    disableRemotePlayback
                    onLoadedMetadata={() => publishDiagnostics({ lastEvent: "loadedmetadata" })}
                    onCanPlay={() => requestPlayback("canplay")}
                    onPlaying={() => {
                        clearAutoplayFallbackTimer();
                        setVideoCanvasActive(true);
                        publishDiagnostics({
                            lastEvent: "playing",
                            visibleSurface: "app-controlled-video",
                        });
                    }}
                    onWaiting={() => scheduleAutoplayFallback("waiting")}
                    onStalled={() => scheduleAutoplayFallback("stalled")}
                    onSuspend={() => publishDiagnostics({ lastEvent: "suspend" })}
                    onPause={() => {
                        if (stageRef.current === "video" && !videoRef.current?.ended) {
                            showAutoplayFallback("paused-before-ended");
                        }
                    }}
                    onDurationChange={() => publishDiagnostics({ lastEvent: "durationchange" })}
                    onEnded={scheduleCompletionAfterEnded}
                    onError={showMediaErrorFallback}
                />
            )}
        </div>
    );
}
