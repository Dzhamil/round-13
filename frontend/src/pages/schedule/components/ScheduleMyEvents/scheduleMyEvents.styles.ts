import type { CSSProperties } from "react";

export const scheduleMyEventsStyles = {
    text: {
        margin: 0,
        fontSize: "14px",
        lineHeight: 1.5,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.7))",
    },
    list: {
        display: "grid",
        gap: "10px",
    },
    topRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "10px",
    },
    eventItem: {
        display: "grid",
        gap: "6px",
        padding: "14px 16px",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
    },
    eventDate: {
        margin: 0,
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--tg-theme-button-color, #6ab3f3)",
    },
    eventLabel: {
        margin: 0,
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "#9ed0ff",
    },
    trainingLabel: {
        margin: 0,
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "#ff8f8f",
    },
    eventTitle: {
        margin: 0,
        fontSize: "16px",
        fontWeight: 700,
        color: "var(--tg-theme-text-color, #ffffff)",
    },
    eventMeta: {
        margin: 0,
        fontSize: "13px",
        lineHeight: 1.45,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.72))",
    },
} satisfies Record<string, CSSProperties>;
