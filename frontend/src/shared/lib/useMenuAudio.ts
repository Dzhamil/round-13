import { useSyncExternalStore } from "react";
import {
    armAutoStartOnFirstGesture,
    getSoundEnabled,
    playBackground,
    playClickRandom,
    setSoundEnabled,
    stopBackground,
    toggleSoundEnabled,
} from "./menuAudio";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
    listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function snapshot() {
    return getSoundEnabled();
}

export function useMenuAudio() {
    const enabled = useSyncExternalStore(subscribe, snapshot, snapshot);

    const toggleEnabled = () => {
        toggleSoundEnabled();
        emit();
    };

    const enable = () => {
        setSoundEnabled(true);
        emit();
    };

    const disable = () => {
        setSoundEnabled(false);
        emit();
    };

    return {
        enabled,
        toggleEnabled,
        enable,
        disable,
        playBackground,
        stopBackground,
        playClick: playClickRandom,
        armAutoStart: armAutoStartOnFirstGesture,
    };
}
