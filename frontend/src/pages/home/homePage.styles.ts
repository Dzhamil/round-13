// frontend/src/pages/home/homePage.styles.ts
import type { CSSProperties } from "react";

/**
 * Контейнер занимает всю область main (fullBleed уже включён в router).
 * Центрирование выполняется абсолютным позиционированием.
 */
export const homePageStyles: Record<string, CSSProperties> = {
    root: {
        position: "relative",
        display: "flex",
        flex: 1,
        minHeight: 0,
    },

    // Строгий центр viewport
    center: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
    },
};
