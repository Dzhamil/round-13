import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";

import styles from "./StartupSplash.module.css";

const INTRO_VIDEO_SRC = "/videos/round13-startup-intro.mp4";
const INTRO_POSTER_SRC = "/images/round13-startup.jpg";
const POST_ENDED_HOLD_MS = 1_000;
const FALLBACK_POSTER_DURATION_MS = 1_000;
const PLAY_RETRY_DELAY_MS = 1_200;
const STALL_RETRY_DELAY_MS = 2_500;

type SplashStage = "video" | "reduced-motion-fallback" | "media-error-fallback" | "complete";
type ReleaseReason = "video-ended" | "reduced-motion" | "media-error";

type StartupSplashDiagnostics = {
    stage: SplashStage;
    releaseReason: ReleaseReason | null;
    lastEvent: string;
    playAttempts: number;
    autoplayBlockedCount: number;
    retryCount: number;
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
    const playRetryTimerRef = useRef<number | null>(null);
    const requestPlaybackRef = useRef<(trigger: string) => void>(() => undefined);
    const isCompleteRef = useRef(false);
    const stageRef = useRef<SplashStage>("video");
    const diagnosticsRef = useRef<StartupSplashDiagnostics>({
        stage: "video",
        releaseReason: null,
        lastEvent: "init",
        playAttempts: 0,
        autoplayBlockedCount: 0,
        retryCount: 0,
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

    const publishDiagnostics = useCallback((patch: Partial<StartupSplashDiagnostics>) => {
        const video = videoRef.current;
        const nextDiagnostics: StartupSplashDiagnostics = {
            ...diagnosticsRef.current,
            ...patch,
            stage: patch.stage ?? stageRef.current,
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

    const clearPlayRetryTimer = useCallback(() => {
        if (playRetryTimerRef.current === null) {
            return;
        }

        window.clearTimeout(playRetryTimerRef.current);
        playRetryTimerRef.current = null;
    }, []);

    const completeSplash = useCallback((releaseReason: ReleaseReason) => {
        if (isCompleteRef.current) {
            return;
        }

        isCompleteRef.current = true;
        clearCompletionTimer();
        clearPlayRetryTimer();
        stageRef.current = "complete";
        videoRef.current?.pause();
        publishDiagnostics({
            completedAt: getDiagnosticsTime(),
            lastEvent: `complete:${releaseReason}`,
            releaseReason,
            stage: "complete",
        });
        setStage("complete");
    }, [clearCompletionTimer, clearPlayRetryTimer, publishDiagnostics]);

    const showMediaErrorFallback = useCallback(() => {
        if (isCompleteRef.current) {
            return;
        }

        clearCompletionTimer();
        clearPlayRetryTimer();
        stageRef.current = "media-error-fallback";
        videoRef.current?.pause();
        publishDiagnostics({
            lastEvent: "media-error-fallback",
            mediaError: getMediaError(videoRef.current) ?? "error-event",
            stage: "media-error-fallback",
        });
        setStage("media-error-fallback");
    }, [clearCompletionTimer, clearPlayRetryTimer, publishDiagnostics]);

    const schedulePlaybackRetry = useCallback((trigger: string, delayMs = PLAY_RETRY_DELAY_MS) => {
        if (stageRef.current !== "video" || isCompleteRef.current) {
            return;
        }

        clearPlayRetryTimer();
        diagnosticsRef.current.retryCount += 1;
        publishDiagnostics({ lastEvent: `retry-scheduled:${trigger}` });
        playRetryTimerRef.current = window.setTimeout(() => {
            requestPlaybackRef.current(`retry:${trigger}`);
        }, delayMs);
    }, [clearPlayRetryTimer, publishDiagnostics]);

    const requestPlayback = useCallback((trigger: string) => {
        const video = videoRef.current;

        if (!video || stageRef.current !== "video" || isCompleteRef.current || video.ended) {
            return;
        }

        configureInlineAutoplayVideo(video);
        diagnosticsRef.current.playAttempts += 1;
        publishDiagnostics({ lastEvent: `play-attempt:${trigger}` });

        const playback = video.play();
        schedulePlaybackRetry("play-pending");

        if (playback === undefined) {
            return;
        }

        void playback.then(() => {
            if (videoRef.current === video && !video.paused && !video.ended) {
                clearPlayRetryTimer();
            }

            publishDiagnostics({ lastEvent: `play-resolved:${trigger}` });
        }).catch((error: unknown) => {
            if (videoRef.current !== video || isCompleteRef.current || stageRef.current !== "video") {
                return;
            }

            diagnosticsRef.current.autoplayBlockedCount += 1;
            publishDiagnostics({
                lastEvent: `autoplay-blocked:${trigger}`,
                lastPlayError: getErrorName(error),
            });

            // Autoplay rejection means playback is blocked or delayed, not that the MP4 failed to load.
            schedulePlaybackRetry("autoplay-blocked");
        });
    }, [clearPlayRetryTimer, publishDiagnostics, schedulePlaybackRetry]);

    useEffect(() => {
        requestPlaybackRef.current = requestPlayback;
    }, [requestPlayback]);

    useEffect(() => {
        stageRef.current = stage;
        publishDiagnostics({ stage, lastEvent: `stage:${stage}` });
    }, [publishDiagnostics, stage]);

    useEffect(() => {
        if (stage !== "video") {
            return undefined;
        }

        requestPlayback("mount");
        return clearPlayRetryTimer;
    }, [clearPlayRetryTimer, requestPlayback, stage]);

    useEffect(() => {
        if (stage !== "reduced-motion-fallback" && stage !== "media-error-fallback") {
            return undefined;
        }

        const releaseReason: ReleaseReason = stage === "reduced-motion-fallback"
            ? "reduced-motion"
            : "media-error";

        completionTimerRef.current = window.setTimeout(() => {
            completeSplash(releaseReason);
        }, FALLBACK_POSTER_DURATION_MS);

        return clearCompletionTimer;
    }, [clearCompletionTimer, completeSplash, stage]);

    useEffect(() => () => {
        clearCompletionTimer();
        clearPlayRetryTimer();
    }, [clearCompletionTimer, clearPlayRetryTimer]);

    const scheduleCompletionAfterEnded = useCallback(() => {
        if (isCompleteRef.current) {
            return;
        }

        clearPlayRetryTimer();
        clearCompletionTimer();
        publishDiagnostics({
            endedAt: getDiagnosticsTime(),
            lastEvent: "ended-hold",
        });
        completionTimerRef.current = window.setTimeout(() => {
            completeSplash("video-ended");
        }, POST_ENDED_HOLD_MS);
    }, [clearCompletionTimer, clearPlayRetryTimer, completeSplash, publishDiagnostics]);

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
            {stage === "video" ? (
                <video
                    ref={videoRef}
                    className={styles.media}
                    src={INTRO_VIDEO_SRC}
                    data-startup-splash-video="intro"
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
                        clearPlayRetryTimer();
                        publishDiagnostics({ lastEvent: "playing" });
                    }}
                    onWaiting={() => schedulePlaybackRetry("waiting", STALL_RETRY_DELAY_MS)}
                    onStalled={() => schedulePlaybackRetry("stalled", STALL_RETRY_DELAY_MS)}
                    onSuspend={() => publishDiagnostics({ lastEvent: "suspend" })}
                    onPause={() => {
                        if (stageRef.current === "video" && !videoRef.current?.ended) {
                            schedulePlaybackRetry("pause", STALL_RETRY_DELAY_MS);
                        }
                    }}
                    onDurationChange={() => publishDiagnostics({ lastEvent: "durationchange" })}
                    onEnded={scheduleCompletionAfterEnded}
                    onError={showMediaErrorFallback}
                />
            ) : (
                <img
                    className={styles.media}
                    src={INTRO_POSTER_SRC}
                    alt=""
                    decoding="async"
                    draggable={false}
                />
            )}
        </div>
    );
}
