import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";

import styles from "./StartupSplash.module.css";

const INTRO_VIDEO_SRC = "/videos/round13-startup-intro.mp4";
const INTRO_POSTER_SRC = "/images/round13-startup.jpg";
const POST_ENDED_HOLD_MS = 1_000;
const FALLBACK_DURATION_MS = 1_000;
const MEDIA_START_FAILURE_TIMEOUT_MS = 15_000;

type SplashStage = "video" | "fallback" | "complete";

function shouldUseReducedMotion(): boolean {
    return typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function StartupSplash({ children }: PropsWithChildren) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const completionTimerRef = useRef<number | null>(null);
    const mediaFailureTimerRef = useRef<number | null>(null);
    const isCompleteRef = useRef(false);
    const [stage, setStage] = useState<SplashStage>(() => (
        shouldUseReducedMotion() ? "fallback" : "video"
    ));

    const clearCompletionTimer = useCallback(() => {
        if (completionTimerRef.current === null) {
            return;
        }

        window.clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
    }, []);

    const clearMediaFailureTimer = useCallback(() => {
        if (mediaFailureTimerRef.current === null) {
            return;
        }

        window.clearTimeout(mediaFailureTimerRef.current);
        mediaFailureTimerRef.current = null;
    }, []);

    const completeSplash = useCallback(() => {
        if (isCompleteRef.current) {
            return;
        }

        isCompleteRef.current = true;
        clearCompletionTimer();
        clearMediaFailureTimer();
        videoRef.current?.pause();
        setStage("complete");
    }, [clearCompletionTimer, clearMediaFailureTimer]);

    const showFallback = useCallback(() => {
        if (isCompleteRef.current) {
            return;
        }

        clearCompletionTimer();
        clearMediaFailureTimer();
        videoRef.current?.pause();
        setStage("fallback");
    }, [clearCompletionTimer, clearMediaFailureTimer]);

    useEffect(() => {
        if (stage !== "video") {
            return undefined;
        }

        mediaFailureTimerRef.current = window.setTimeout(() => {
            const video = videoRef.current;

            if (!video || isCompleteRef.current || video.ended || !video.paused) {
                return;
            }

            showFallback();
        }, MEDIA_START_FAILURE_TIMEOUT_MS);

        return clearMediaFailureTimer;
    }, [clearMediaFailureTimer, showFallback, stage]);

    useEffect(() => {
        if (stage !== "fallback") {
            return undefined;
        }

        completionTimerRef.current = window.setTimeout(completeSplash, FALLBACK_DURATION_MS);
        return clearCompletionTimer;
    }, [clearCompletionTimer, completeSplash, stage]);

    useEffect(() => () => {
        clearCompletionTimer();
        clearMediaFailureTimer();
    }, [clearCompletionTimer, clearMediaFailureTimer]);

    const startVideo = useCallback(() => {
        const video = videoRef.current;

        if (!video || isCompleteRef.current) {
            return;
        }

        const playback = video.play();

        if (playback !== undefined) {
            void playback.catch(() => {
                if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
                    return;
                }

                showFallback();
            });
        }
    }, [showFallback]);

    const scheduleCompletionAfterEnded = useCallback(() => {
        if (isCompleteRef.current) {
            return;
        }

        clearMediaFailureTimer();
        clearCompletionTimer();
        completionTimerRef.current = window.setTimeout(completeSplash, POST_ENDED_HOLD_MS);
    }, [clearCompletionTimer, clearMediaFailureTimer, completeSplash]);

    if (stage === "complete") {
        return <>{children}</>;
    }

    return (
        <div className={styles.overlay} aria-hidden="true" data-startup-splash="overlay">
            {stage === "video" ? (
                <video
                    ref={videoRef}
                    className={styles.media}
                    src={INTRO_VIDEO_SRC}
                    data-startup-splash-video="intro"
                    poster={INTRO_POSTER_SRC}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    controls={false}
                    disablePictureInPicture
                    onCanPlay={startVideo}
                    onPlaying={clearMediaFailureTimer}
                    onEnded={scheduleCompletionAfterEnded}
                    onError={showFallback}
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
