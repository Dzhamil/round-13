import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";

import styles from "./StartupSplash.module.css";

const INTRO_VIDEO_SRC = "/videos/round13-startup-intro.mp4";
const INTRO_POSTER_SRC = "/images/round13-startup.jpg";
const POST_ENDED_HOLD_MS = 1_000;
const CONTROLLED_FALLBACK_DURATION_MS = 8_000;
const FALLBACK_POSTER_DURATION_MS = 1_000;
const AUTOPLAY_FALLBACK_DELAY_MS = 2_500;

type SplashStage = "video" | "autoplay-fallback" | "reduced-motion-fallback" | "media-error-fallback" | "complete";
type ReleaseReason = "video-ended" | "autoplay-fallback" | "reduced-motion" | "media-error";
type VisibleSurface = "app-controlled-fallback" | "native-video" | "none";

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
    const [isVideoVisible, setIsVideoVisible] = useState(false);
    const isVideoVisibleRef = useRef(false);

    const setVideoVisibility = useCallback((isVisible: boolean) => {
        isVideoVisibleRef.current = isVisible;
        setIsVideoVisible(isVisible);
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
        setVideoVisibility(false);
        publishDiagnostics({
            completedAt: getDiagnosticsTime(),
            lastEvent: `complete:${releaseReason}`,
            releaseReason,
            stage: "complete",
            visibleSurface: "none",
        });
        setStage("complete");
    }, [clearAutoplayFallbackTimer, clearCompletionTimer, publishDiagnostics, setVideoVisibility]);

    const showAutoplayFallback = useCallback((reason: string) => {
        if (isCompleteRef.current || stageRef.current !== "video") {
            return;
        }

        clearCompletionTimer();
        clearAutoplayFallbackTimer();
        stageRef.current = "autoplay-fallback";
        diagnosticsRef.current.autoplayFallbackCount += 1;
        videoRef.current?.pause();
        setVideoVisibility(false);
        publishDiagnostics({
            autoplayFallbackReason: reason,
            controlledFallbackDurationMs: CONTROLLED_FALLBACK_DURATION_MS + POST_ENDED_HOLD_MS,
            lastEvent: `autoplay-fallback:${reason}`,
            stage: "autoplay-fallback",
            visibleSurface: "app-controlled-fallback",
        });
        setStage("autoplay-fallback");
    }, [clearAutoplayFallbackTimer, clearCompletionTimer, publishDiagnostics, setVideoVisibility]);

    const showMediaErrorFallback = useCallback(() => {
        if (isCompleteRef.current) {
            return;
        }

        clearCompletionTimer();
        clearAutoplayFallbackTimer();
        stageRef.current = "media-error-fallback";
        videoRef.current?.pause();
        setVideoVisibility(false);
        publishDiagnostics({
            lastEvent: "media-error-fallback",
            mediaError: getMediaError(videoRef.current) ?? "error-event",
            stage: "media-error-fallback",
            visibleSurface: "app-controlled-fallback",
        });
        setStage("media-error-fallback");
    }, [clearAutoplayFallbackTimer, clearCompletionTimer, publishDiagnostics, setVideoVisibility]);

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
            visibleSurface: isVideoVisibleRef.current ? "native-video" : "app-controlled-fallback",
        });

        const playback = video.play();
        scheduleAutoplayFallback("play-pending");

        if (playback === undefined) {
            return;
        }

        void playback.then(() => {
            if (videoRef.current === video && !video.paused && !video.ended) {
                clearAutoplayFallbackTimer();
                setVideoVisibility(true);
            }

            publishDiagnostics({
                lastEvent: `play-resolved:${trigger}`,
                visibleSurface: isVideoVisibleRef.current ? "native-video" : "app-controlled-fallback",
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

            // Autoplay rejection means the visual intro must continue on our own surface, not native media UI.
            showAutoplayFallback("play-rejected");
        });
    }, [clearAutoplayFallbackTimer, publishDiagnostics, scheduleAutoplayFallback, setVideoVisibility, showAutoplayFallback]);

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
            {(stage !== "video" || !isVideoVisible) && (
                <div
                    className={styles.fallbackSurface}
                    data-startup-splash-surface="app-fallback"
                >
                    <img
                        className={styles.fallbackPoster}
                        src={INTRO_POSTER_SRC}
                        alt=""
                        decoding="async"
                        draggable={false}
                    />
                    <div className={styles.fallbackVignette} />
                    <div className={styles.fallbackSweep} />
                </div>
            )}
            {stage === "video" && (
                <video
                    ref={videoRef}
                    className={`${styles.media} ${isVideoVisible ? styles.videoVisible : styles.videoHidden}`}
                    src={INTRO_VIDEO_SRC}
                    data-startup-splash-video="intro"
                    data-startup-splash-video-visible={isVideoVisible ? "true" : "false"}
                    poster={INTRO_POSTER_SRC}
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
                        setVideoVisibility(true);
                        publishDiagnostics({
                            lastEvent: "playing",
                            visibleSurface: "native-video",
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
