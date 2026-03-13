import type { CSSProperties } from "react";

export const schedulePageStyles = {
    root: {
        display: "grid",
        gap: "12px",
        padding: "8px 0 24px",
    },
    tabsWrap: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
        padding: "2px 0",
    },
    tab: (active: boolean): CSSProperties => ({
        minWidth: 0,
        height: 40,
        padding: "0 10px",
        borderRadius: 14,
        border: active
            ? "1px solid rgba(106,179,243,0.55)"
            : "1px solid rgba(255,255,255,0.08)",
        background: active
            ? "linear-gradient(180deg, rgba(48,71,97,0.98) 0%, rgba(35,52,71,0.98) 100%)"
            : "linear-gradient(180deg, rgba(38,49,64,0.96) 0%, rgba(31,42,56,0.96) 100%)",
        color: active
            ? "#7fc2ff"
            : "var(--tg-theme-text-color, rgba(255,255,255,0.92))",
        boxShadow: active
            ? "inset 0 0 0 1px rgba(127,194,255,0.08)"
            : "none",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.01em",
        lineHeight: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer",
        appearance: "none",
    }),
    card: {
        display: "grid",
        gap: "10px",
        padding: "18px",
        borderRadius: "18px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
    },
    title: {
        margin: 0,
        fontSize: "16px",
        fontWeight: 800,
        color: "var(--tg-theme-text-color, #ffffff)",
    },
} satisfies Record<string, CSSProperties>;
