import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";

import styles from "./StartupSplash.module.css";

const INTRO_VIDEO_SRC = "/videos/round13-startup-intro.mp4";
const INTRO_POSTER_SRC = "/images/round13-startup.jpg";
const MAX_SPLASH_DURATION_MS = 12_000;
const FALLBACK_DURATION_MS = 900;

type SplashStage = "video" | "fallback" | "complete";

function shouldUseReducedMotion(): boolean {
    return typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function StartupSplash({ children }: PropsWithChildren) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const isCompleteRef = useRef(false);
    const [stage, setStage] = useState<SplashStage>(() => (
        shouldUseReducedMotion() ? "fallback" : "video"
    ));

    const completeSplash = useCallback(() => {
        if (isCompleteRef.current) {
            return;
        }

        isCompleteRef.current = true;
        videoRef.current?.pause();
        setStage("complete");
    }, []);

    const showFallback = useCallback(() => {
        if (!isCompleteRef.current) {
            setStage("fallback");
        }
    }, []);

    useEffect(() => {
        if (stage === "complete") {
            return undefined;
        }

        const timeoutId = window.setTimeout(completeSplash, MAX_SPLASH_DURATION_MS);
        return () => window.clearTimeout(timeoutId);
    }, [completeSplash, stage]);

    useEffect(() => {
        if (stage !== "fallback") {
            return undefined;
        }

        const timeoutId = window.setTimeout(completeSplash, FALLBACK_DURATION_MS);
        return () => window.clearTimeout(timeoutId);
    }, [completeSplash, stage]);

    const startVideo = useCallback(() => {
        const video = videoRef.current;

        if (!video || isCompleteRef.current) {
            return;
        }

        const playback = video.play();

        if (playback !== undefined) {
            void playback.catch(showFallback);
        }
    }, [showFallback]);

    if (stage === "complete") {
        return <>{children}</>;
    }

    return (
        <div className={styles.overlay} aria-hidden="true">
            {stage === "video" ? (
                <video
                    ref={videoRef}
                    className={styles.media}
                    src={INTRO_VIDEO_SRC}
                    poster={INTRO_POSTER_SRC}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    controls={false}
                    disablePictureInPicture
                    onCanPlay={startVideo}
                    onEnded={completeSplash}
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
