const OST_URL = "/sounds/menu/MainThemeOST.mp3";

const CLICK_SOUNDS = [
    "/sounds/button-pressed-1.mp3",
    "/sounds/click-enter.mp3",
    "/sounds/zoom.mp3",
    "/sounds/usp-slideback.mp3",
    "/sounds/usp-sliderelease.mp3",
];

const STORAGE_KEY = "round13_sound_enabled";

function readEnabled(): boolean {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === null) return true;
        return v === "1";
    } catch {
        return true;
    }
}

function writeEnabled(v: boolean) {
    try {
        localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {}
}

let enabled = readEnabled();
let bg: HTMLAudioElement | null = null;
let gestureArmed = false;

function ensureBg() {
    if (bg) return;
    bg = new Audio(OST_URL);
    bg.loop = true;
    bg.volume = 0.35;
}

export function getSoundEnabled() {
    return enabled;
}

export function setSoundEnabled(v: boolean) {
    enabled = v;
    writeEnabled(v);

    if (!enabled) {
        stopBackground();
    }
}

export function toggleSoundEnabled() {
    const next = !enabled;
    setSoundEnabled(next);

    if (next) {
        playBackground();
    }
}

export function playBackground() {
    if (!enabled) return;

    ensureBg();

    bg?.play().catch(() => {
        // autoplay может быть запрещён
    });
}

export function stopBackground() {
    if (!bg) return;
    bg.pause();
}

export function armAutoStartOnFirstGesture() {
    if (gestureArmed) return;
    gestureArmed = true;

    const start = () => {
        if (!enabled) return;
        playBackground();
    };

    // 👇 важный момент — только один раз
    window.addEventListener("pointerdown", start, { once: true });
}

export function playClickRandom() {
    if (!enabled) return;

    const url =
        CLICK_SOUNDS[Math.floor(Math.random() * CLICK_SOUNDS.length)];

    const a = new Audio(url);
    a.volume = 0.75;
    a.play().catch(() => {});
}
