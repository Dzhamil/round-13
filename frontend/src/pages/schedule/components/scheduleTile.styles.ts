// frontend/src/pages/schedule/components/scheduleTile.styles.ts
import type { CSSProperties } from "react";

export const scheduleTileStyles: Record<string, CSSProperties> = {
    card: {
        appearance: "none",
        width: "100%",
        padding: "18px",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.96) 0%, rgba(24,33,43,0.96) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
        display: "grid",
        gap: "12px",
        textAlign: "left",
        cursor: "pointer",
        font: "inherit",
    },

    topRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "12px",
    },

    titleBlock: {
        display: "grid",
        gap: "6px",
        minWidth: 0,
    },

    badges: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
    },

    badge: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "28px",
        padding: "6px 10px",
        borderRadius: "999px",
        border: "1px solid rgba(46,166,255,0.28)",
        background: "rgba(46,166,255,0.14)",
        color: "var(--tg-theme-button-color, #62b0ff)",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
    },

    dateBadge: {
        display: "inline-flex",
        alignItems: "center",
        minHeight: "28px",
        padding: "6px 10px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.05)",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.72))",
        fontSize: "12px",
        fontWeight: 600,
        whiteSpace: "nowrap",
    },

    title: {
        fontWeight: 700,
        fontSize: "17px",
        lineHeight: 1.2,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    },

    meta: {
        fontSize: "13px",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
    },

    time: {
        fontSize: "16px",
        color: "var(--tg-theme-button-color, #62b0ff)",
        fontWeight: 700,
    },

    description: {
        fontSize: "14px",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.78))",
        lineHeight: 1.55,
    },

    footer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
    },

    footerMeta: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
        fontSize: "13px",
    },

    cta: {
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--tg-theme-button-color, #62b0ff)",
    },
};
