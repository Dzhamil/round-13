import {
    MouseEvent as ReactMouseEvent,
    PointerEvent as ReactPointerEvent,
    PropsWithChildren,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

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
const PLAY_START_TIMEOUT_MS = 2_500;
const PLAYBACK_STALL_FALLBACK_MS = 2_500;

type SplashStage =
    | "awaiting-audio-gesture"
    | "starting-audio"
    | "starting-muted"
    | "video-audio"
    | "video-muted"
    | "frame-fallback"
    | "reduced-motion-fallback"
    | "media-error-fallback"
    | "complete";
type ReleaseReason = "video-ended" | "frame-fallback" | "reduced-motion" | "media-error";
type VisibleSurface = "native-video" | "app-controlled-fallback" | "none";
type FallbackVisualSource = "mp4-frame-sequence";
type SoundPolicy =
    | "awaiting-user-gesture-for-audio"
    | "gesture-audio-starting"
    | "gesture-audio-playing"
    | "gesture-audio-rejected-muted-starting"
    | "gesture-audio-rejected-muted-video"
    | "gesture-audio-rejected-frame-fallback"
    | "reduced-motion-no-video"
    | "media-error-frame-fallback";

type StartupSplashDiagnostics = {
    stage: SplashStage;
    releaseReason: ReleaseReason | null;
    visibleSurface: VisibleSurface;
    lastEvent: string;
    audioGestureReceived: boolean;
    playAttempts: number;
    unmutedPlayAttempts: number;
    mutedPlayAttempts: number;
    unmutedPlayAttemptBeforeGesture: boolean;
    audioRejectedCount: number;
    playbackFallbackCount: number;
    playbackFallbackReason: string | null;
    controlledFallbackDurationMs: number | null;
    fallbackVisualSource: FallbackVisualSource;
    fallbackSourceSha256: string;
    fallbackFrameCount: number;
    fallbackFrameIndex: number | null;
    fallbackFrameSrc: string | null;
    fallbackFrameSourceTimeMs: number | null;
    canvasDrawCount: number;
    lastVideoCanvasTime: number | null;
    soundPolicy: SoundPolicy;
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

function configureBaseVideo(video: HTMLVideoElement): void {
    video.autoplay = false;
    video.playsInline = true;
    video.preload = "auto";
    video.controls = false;
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;

    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("preload", "auto");
    video.removeAttribute("autoplay");
    video.removeAttribute("controls");
}

function configureIdleMutedVideo(video: HTMLVideoElement): void {
    configureBaseVideo(video);
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
}

function configureGestureAudioVideo(video: HTMLVideoElement): void {
    configureBaseVideo(video);
    video.muted = false;
    video.defaultMuted = false;
    video.removeAttribute("muted");
}

function configureMutedFallbackVideo(video: HTMLVideoElement): void {
    configureBaseVideo(video);
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
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

type FallbackVisualProps = {
    animated: boolean;
    hidden: boolean;
    onFrameChange: (frame: StartupSplashFallbackFrame) => void;
    startedAtMs: number;
};

function StartupSplashFallbackVisual({
    animated,
    hidden,
    onFrameChange,
    startedAtMs,
}: FallbackVisualProps) {
    const [frameIndex, setFrameIndex] = useState(() => (
        animated ? getFallbackFrameIndex(getDiagnosticsTime() - startedAtMs) : 0
    ));

    useEffect(() => {
        if (!animated) {
            setFrameIndex(0);
            return undefined;
        }

        let animationFrame = 0;
        const updateFrame = () => {
            const elapsedMs = getDiagnosticsTime() - startedAtMs;
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
    }, [animated, startedAtMs]);

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

function isNativeVideoStage(stage: SplashStage): boolean {
    return stage === "video-audio" || stage === "video-muted";
}

function isPlaybackStage(stage: SplashStage): boolean {
    return stage === "starting-audio"
        || stage === "starting-muted"
        || stage === "video-audio"
        || stage === "video-muted";
}

export function StartupSplash({ children }: PropsWithChildren) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const fallbackPreloadRef = useRef<HTMLImageElement[]>([]);
    const completionTimerRef = useRef<number | null>(null);
    const playbackFallbackTimerRef = useRef<number | null>(null);
    const isCompleteRef = useRef(false);
    const audioGestureReceivedRef = useRef(false);
    const startRequestIssuedRef = useRef(false);
    const fallbackStartedAtRef = useRef(getDiagnosticsTime());
    const stageRef = useRef<SplashStage>(
        shouldUseReducedMotion() ? "reduced-motion-fallback" : "awaiting-audio-gesture",
    );
    const diagnosticsRef = useRef<StartupSplashDiagnostics>({
        stage: stageRef.current,
        releaseReason: null,
        visibleSurface: "app-controlled-fallback",
        lastEvent: "init",
        audioGestureReceived: false,
        playAttempts: 0,
        unmutedPlayAttempts: 0,
        mutedPlayAttempts: 0,
        unmutedPlayAttemptBeforeGesture: false,
        audioRejectedCount: 0,
        playbackFallbackCount: 0,
        playbackFallbackReason: null,
        controlledFallbackDurationMs: null,
        fallbackVisualSource: "mp4-frame-sequence",
        fallbackSourceSha256: STARTUP_SPLASH_FALLBACK_SOURCE_SHA256,
        fallbackFrameCount: STARTUP_SPLASH_FALLBACK_FRAMES.length,
        fallbackFrameIndex: null,
        fallbackFrameSrc: null,
        fallbackFrameSourceTimeMs: null,
        canvasDrawCount: 0,
        lastVideoCanvasTime: null,
        soundPolicy: shouldUseReducedMotion() ? "reduced-motion-no-video" : "awaiting-user-gesture-for-audio",
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
    const [stage, setStageState] = useState<SplashStage>(stageRef.current);

    useEffect(() => {
        fallbackPreloadRef.current = STARTUP_SPLASH_FALLBACK_FRAMES.map((frame) => {
            const image = new Image();
            image.decoding = "async";
            image.src = frame.src;
            void image.decode?.().catch(() => undefined);
            return image;
        });

        return () => {
            fallbackPreloadRef.current = [];
        };
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

    const setStage = useCallback((nextStage: SplashStage, patch: Partial<StartupSplashDiagnostics> = {}) => {
        stageRef.current = nextStage;
        publishDiagnostics({
            ...patch,
            stage: nextStage,
            visibleSurface: patch.visibleSurface ?? (isNativeVideoStage(nextStage) ? "native-video" : "app-controlled-fallback"),
        });
        setStageState(nextStage);
    }, [publishDiagnostics]);

    const clearCompletionTimer = useCallback(() => {
        if (completionTimerRef.current === null) {
            return;
        }

        window.clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
    }, []);

    const clearPlaybackFallbackTimer = useCallback(() => {
        if (playbackFallbackTimerRef.current === null) {
            return;
        }

        window.clearTimeout(playbackFallbackTimerRef.current);
        playbackFallbackTimerRef.current = null;
    }, []);

    const completeSplash = useCallback((releaseReason: ReleaseReason) => {
        if (isCompleteRef.current) {
            return;
        }

        isCompleteRef.current = true;
        clearCompletionTimer();
        clearPlaybackFallbackTimer();
        stageRef.current = "complete";
        videoRef.current?.pause();
        publishDiagnostics({
            completedAt: getDiagnosticsTime(),
            lastEvent: `complete:${releaseReason}`,
            releaseReason,
            stage: "complete",
            visibleSurface: "none",
        });
        setStageState("complete");
    }, [clearCompletionTimer, clearPlaybackFallbackTimer, publishDiagnostics]);

    const showFrameFallback = useCallback((reason: string, soundPolicy: SoundPolicy = "gesture-audio-rejected-frame-fallback") => {
        if (isCompleteRef.current || stageRef.current === "frame-fallback") {
            return;
        }

        clearCompletionTimer();
        clearPlaybackFallbackTimer();
        fallbackStartedAtRef.current = getDiagnosticsTime();
        diagnosticsRef.current.playbackFallbackCount += 1;
        videoRef.current?.pause();
        setStage("frame-fallback", {
            controlledFallbackDurationMs: CONTROLLED_FALLBACK_DURATION_MS + POST_ENDED_HOLD_MS,
            lastEvent: `frame-fallback:${reason}`,
            playbackFallbackReason: reason,
            soundPolicy,
            visibleSurface: "app-controlled-fallback",
        });
    }, [clearCompletionTimer, clearPlaybackFallbackTimer, setStage]);

    const showMediaErrorFallback = useCallback(() => {
        if (isCompleteRef.current) {
            return;
        }

        clearCompletionTimer();
        clearPlaybackFallbackTimer();
        fallbackStartedAtRef.current = getDiagnosticsTime();
        videoRef.current?.pause();
        setStage("media-error-fallback", {
            controlledFallbackDurationMs: FALLBACK_POSTER_DURATION_MS,
            lastEvent: "media-error-fallback",
            mediaError: getMediaError(videoRef.current) ?? "error-event",
            soundPolicy: "media-error-frame-fallback",
            visibleSurface: "app-controlled-fallback",
        });
    }, [clearCompletionTimer, clearPlaybackFallbackTimer, setStage]);

    const schedulePlaybackFallback = useCallback((trigger: string, delayMs = PLAYBACK_STALL_FALLBACK_MS) => {
        if (!isPlaybackStage(stageRef.current) || isCompleteRef.current) {
            return;
        }

        if (playbackFallbackTimerRef.current !== null) {
            publishDiagnostics({ lastEvent: `playback-fallback-already-scheduled:${trigger}` });
            return;
        }

        publishDiagnostics({ lastEvent: `playback-fallback-scheduled:${trigger}` });
        playbackFallbackTimerRef.current = window.setTimeout(() => {
            showFrameFallback(trigger);
        }, delayMs);
    }, [publishDiagnostics, showFrameFallback]);

    const scheduleCompletionAfterEnded = useCallback(() => {
        if (isCompleteRef.current) {
            return;
        }

        clearPlaybackFallbackTimer();
        clearCompletionTimer();
        publishDiagnostics({
            endedAt: getDiagnosticsTime(),
            lastEvent: "ended-hold",
            visibleSurface: "native-video",
        });
        completionTimerRef.current = window.setTimeout(() => {
            completeSplash("video-ended");
        }, POST_ENDED_HOLD_MS);
    }, [clearCompletionTimer, clearPlaybackFallbackTimer, completeSplash, publishDiagnostics]);

    const requestPlayback = useCallback((muted: boolean, trigger: string) => {
        const video = videoRef.current;

        if (!video || isCompleteRef.current || stageRef.current === "complete" || video.ended) {
            return;
        }

        if (muted) {
            configureMutedFallbackVideo(video);
            setStage("starting-muted", {
                lastEvent: `play-attempt:${trigger}:muted`,
                soundPolicy: "gesture-audio-rejected-muted-starting",
                visibleSurface: "app-controlled-fallback",
            });
        } else {
            configureGestureAudioVideo(video);
            setStage("starting-audio", {
                audioGestureReceived: audioGestureReceivedRef.current,
                lastEvent: `play-attempt:${trigger}:audio`,
                soundPolicy: "gesture-audio-starting",
                visibleSurface: "app-controlled-fallback",
            });
        }

        diagnosticsRef.current.playAttempts += 1;

        if (muted) {
            diagnosticsRef.current.mutedPlayAttempts += 1;
        } else {
            diagnosticsRef.current.unmutedPlayAttempts += 1;

            if (!audioGestureReceivedRef.current) {
                diagnosticsRef.current.unmutedPlayAttemptBeforeGesture = true;
            }
        }

        publishDiagnostics({
            audioGestureReceived: audioGestureReceivedRef.current,
            lastEvent: `play-called:${trigger}:${muted ? "muted" : "audio"}`,
        });

        clearPlaybackFallbackTimer();
        schedulePlaybackFallback(`${trigger}-play-pending`, PLAY_START_TIMEOUT_MS);

        const playback = video.play();

        if (playback === undefined) {
            return;
        }

        void playback.catch((error: unknown) => {
            if (videoRef.current !== video || isCompleteRef.current) {
                return;
            }

            clearPlaybackFallbackTimer();
            publishDiagnostics({
                lastEvent: `play-rejected:${trigger}:${muted ? "muted" : "audio"}`,
                lastPlayError: getErrorName(error),
            });

            if (!muted) {
                diagnosticsRef.current.audioRejectedCount += 1;
                requestPlayback(true, "audio-rejected");
                return;
            }

            showFrameFallback("muted-play-rejected");
        });
    }, [clearPlaybackFallbackTimer, publishDiagnostics, schedulePlaybackFallback, setStage, showFrameFallback]);

    const handleStartWithSound = useCallback((
        event: ReactPointerEvent<HTMLButtonElement> | ReactMouseEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault();

        if (stageRef.current !== "awaiting-audio-gesture" || startRequestIssuedRef.current) {
            return;
        }

        startRequestIssuedRef.current = true;
        audioGestureReceivedRef.current = true;
        publishDiagnostics({
            audioGestureReceived: true,
            lastEvent: `audio-gesture:${event.type}`,
            soundPolicy: "gesture-audio-starting",
        });
        requestPlayback(false, event.type);
    }, [publishDiagnostics, requestPlayback]);

    const handleFallbackFrameChange = useCallback((frame: StartupSplashFallbackFrame) => {
        publishDiagnostics({
            fallbackFrameIndex: frame.index,
            fallbackFrameSourceTimeMs: frame.sourceTimeMs,
            fallbackFrameSrc: frame.src,
            fallbackVisualSource: "mp4-frame-sequence",
        });
    }, [publishDiagnostics]);

    useEffect(() => {
        publishDiagnostics({ stage, lastEvent: `stage:${stage}` });
    }, [publishDiagnostics, stage]);

    useEffect(() => {
        if (stage === "reduced-motion-fallback") {
            fallbackStartedAtRef.current = getDiagnosticsTime();
            publishDiagnostics({
                controlledFallbackDurationMs: FALLBACK_POSTER_DURATION_MS,
                lastEvent: "reduced-motion-fallback",
                soundPolicy: "reduced-motion-no-video",
                visibleSurface: "app-controlled-fallback",
            });
            return undefined;
        }

        if (stage !== "awaiting-audio-gesture") {
            return undefined;
        }

        const video = videoRef.current;

        if (!video) {
            return undefined;
        }

        configureIdleMutedVideo(video);
        video.load();

        return undefined;
    }, [publishDiagnostics, stage]);

    useEffect(() => {
        if (
            stage !== "frame-fallback"
            && stage !== "reduced-motion-fallback"
            && stage !== "media-error-fallback"
        ) {
            return undefined;
        }

        const releaseReason: ReleaseReason = {
            "frame-fallback": "frame-fallback",
            "reduced-motion-fallback": "reduced-motion",
            "media-error-fallback": "media-error",
        }[stage];
        const fallbackDurationMs = stage === "frame-fallback"
            ? CONTROLLED_FALLBACK_DURATION_MS + POST_ENDED_HOLD_MS
            : FALLBACK_POSTER_DURATION_MS;

        completionTimerRef.current = window.setTimeout(() => {
            completeSplash(releaseReason);
        }, fallbackDurationMs);

        return clearCompletionTimer;
    }, [clearCompletionTimer, completeSplash, stage]);

    useEffect(() => () => {
        clearCompletionTimer();
        clearPlaybackFallbackTimer();
    }, [clearCompletionTimer, clearPlaybackFallbackTimer]);

    const handleNativePlaying = useCallback(() => {
        const video = videoRef.current;

        if (!video || isCompleteRef.current) {
            return;
        }

        clearPlaybackFallbackTimer();

        if (video.muted) {
            setStage("video-muted", {
                lastEvent: "playing:muted",
                soundPolicy: "gesture-audio-rejected-muted-video",
                visibleSurface: "native-video",
            });
            return;
        }

        setStage("video-audio", {
            lastEvent: "playing:audio",
            soundPolicy: "gesture-audio-playing",
            visibleSurface: "native-video",
        });
    }, [clearPlaybackFallbackTimer, setStage]);

    const handleNativePause = useCallback(() => {
        if (isPlaybackStage(stageRef.current) && !videoRef.current?.ended) {
            showFrameFallback("paused-before-ended");
        }
    }, [showFrameFallback]);

    const handleNativeTimeUpdate = useCallback(() => {
        const video = videoRef.current;

        if (video && isNativeVideoStage(stageRef.current) && !video.paused) {
            clearPlaybackFallbackTimer();
        }

        publishDiagnostics({ lastEvent: "timeupdate" });
    }, [clearPlaybackFallbackTimer, publishDiagnostics]);

    if (stage === "complete") {
        return <>{children}</>;
    }

    const isNativeVideoVisible = isNativeVideoStage(stage);
    const isFrameFallbackAnimated = stage === "frame-fallback";
    const isGateVisible = stage === "awaiting-audio-gesture" || stage === "starting-audio" || stage === "starting-muted";

    return (
        <div
            className={styles.overlay}
            aria-label="Стартовая заставка"
            data-startup-splash="overlay"
            data-startup-splash-stage={stage}
        >
            <div
                className={styles.appVisualSurface}
                data-startup-splash-surface="app-fallback"
                data-startup-splash-visible-surface={isNativeVideoVisible ? "native-video" : "app-controlled-fallback"}
            >
                <StartupSplashFallbackVisual
                    animated={isFrameFallbackAnimated}
                    hidden={isNativeVideoVisible}
                    onFrameChange={handleFallbackFrameChange}
                    startedAtMs={fallbackStartedAtRef.current}
                />
            </div>
            {stage !== "reduced-motion-fallback" && stage !== "media-error-fallback" && (
                <video
                    ref={videoRef}
                    className={`${styles.nativeVideo} ${isNativeVideoVisible ? styles.nativeVideoVisible : ""}`}
                    src={INTRO_VIDEO_SRC}
                    data-startup-splash-video="intro"
                    data-startup-splash-video-visible={isNativeVideoVisible ? "true" : "false"}
                    playsInline
                    preload="auto"
                    controls={false}
                    controlsList="nodownload noplaybackrate noremoteplayback"
                    disablePictureInPicture
                    disableRemotePlayback
                    onLoadedMetadata={() => publishDiagnostics({ lastEvent: "loadedmetadata" })}
                    onCanPlay={() => publishDiagnostics({ lastEvent: "canplay" })}
                    onPlaying={handleNativePlaying}
                    onTimeUpdate={handleNativeTimeUpdate}
                    onWaiting={() => schedulePlaybackFallback("waiting")}
                    onStalled={() => schedulePlaybackFallback("stalled")}
                    onSuspend={() => publishDiagnostics({ lastEvent: "suspend" })}
                    onPause={handleNativePause}
                    onDurationChange={() => publishDiagnostics({ lastEvent: "durationchange" })}
                    onEnded={scheduleCompletionAfterEnded}
                    onError={showMediaErrorFallback}
                />
            )}
            {isGateVisible && (
                <div className={styles.gate} data-startup-splash-gate="audio">
                    <button
                        className={styles.soundButton}
                        type="button"
                        disabled={stage !== "awaiting-audio-gesture"}
                        onPointerDown={handleStartWithSound}
                        onClick={handleStartWithSound}
                        data-startup-splash-start-audio="true"
                    >
                        {stage === "awaiting-audio-gesture" ? "Начать со звуком" : "Запуск..."}
                    </button>
                </div>
            )}
        </div>
    );
}
