// frontend/src/pages/schedule/schedulePage.styles.ts
import type { CSSProperties } from "react";

export const schedulePageStyles: Record<string, CSSProperties> = {
    root: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
        background: "#f7f8fa",
        minHeight: "100%",
    },

    grid: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },

    empty: {
        textAlign: "center",
        color: "#8e8e93",
        fontSize: "14px",
        marginTop: "20px",
    },
};
