import { useEffect } from "react";
import { playClickRandom } from "../menuAudio";
import { shouldPlayClickSound } from "./shouldPlayClickSound";

type Options = {
    target?: Window | Document | HTMLElement;
};

export function useGlobalClickSound(options: Options = {}) {
    useEffect(() => {
        const t = options.target ?? window;

        const handler = (e: Event) => {
            const pe = e as PointerEvent;
            if (!shouldPlayClickSound(pe)) return;
            playClickRandom();
        };

        t.addEventListener("pointerdown", handler, true);
        return () => t.removeEventListener("pointerdown", handler, true);
    }, [options.target]);
}
