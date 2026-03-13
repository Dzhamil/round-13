import type { CSSProperties } from "react";

export const schedulePageStyles = {
    root: {
        display: "grid",
        gap: "16px",
        padding: "8px 0 24px",
    },
    card: {
        display: "grid",
        gap: "12px",
        padding: "20px",
        borderRadius: "18px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
    },
    title: {
        margin: 0,
        fontSize: "20px",
        fontWeight: 800,
        color: "var(--tg-theme-text-color, #ffffff)",
    },
} satisfies Record<string, CSSProperties>;
