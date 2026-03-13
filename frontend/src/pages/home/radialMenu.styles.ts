// frontend/src/pages/home/radialMenu.styles.ts
import type { CSSProperties } from "react";

export const radialMenuStyles: Record<string, CSSProperties> = {
    root: {
        userSelect: "none",
    },

    svg: {
        display: "block",
    },

    slice: {
        cursor: "pointer",
        transition: "all 0.15s ease",
    },
};
