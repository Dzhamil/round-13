// frontend/src/pages/timetable/styles/monthCalendar.styles.ts
import type { CSSProperties } from "react";
import type { TrainingStatusTone } from "../model/trainingStatusTone";

export const monthCalendarStyles: Record<string, any> = {
    weekdaysRow: {
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: 0,
        padding: "12px 12px 0",
    },

    weekdayCell: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 0,
        fontSize: "11px",
        fontWeight: 600,
        color: "rgba(255,255,255,0.55)",
        textTransform: "uppercase",
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: 0,
        padding: "8px 12px 16px",
    },

    cell: {
        minHeight: "76px",
        padding: "8px 6px 6px",
        cursor: "pointer",
        userSelect: "none",
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        background: "transparent",
        minWidth: 0,
    },

    firstRow: {
        borderTop: "1px solid rgba(255,255,255,0.08)",
    },

    prev: {
        color: "rgba(255,255,255,0.35)",
    },

    next: {
        color: "rgba(255,255,255,0.35)",
    },

    current: {
        color: "rgba(255,255,255,0.9)",
    },

    today: {
        color: "#fff",
    },

    selected: {
        background: "rgba(255,255,255,0.04)",
    },

    cellHeader: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "24px",
        marginBottom: "6px",
    },

    dayNumber: {
        display: "inline-block",
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: 1,
    },

    dayNumberToday: {
        color: "#6ab3f3",
        fontWeight: 700,
    },

    dayNumberSelected: {
        color: "#ffffff",
        fontWeight: 700,
    },

    dot: (tone: TrainingStatusTone): CSSProperties => ({
        position: "absolute",
        top: "6px",
        right: "2px",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background:
            tone === "danger"
                ? "#ff6b6b"
                : tone === "warning"
                    ? "#f7c948"
                    : tone === "success"
                        ? "#43d17a"
                        : "#6ab3f3",
        boxShadow:
            tone === "danger"
                ? "0 0 0 3px rgba(255,107,107,0.16)"
                : tone === "warning"
                    ? "0 0 0 3px rgba(247,201,72,0.16)"
                    : tone === "success"
                        ? "0 0 0 3px rgba(67,209,122,0.16)"
                        : "0 0 0 3px rgba(106,179,243,0.16)",
    }),

    labelsWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "1px",
        minWidth: 0,
    },

    subLabel: {
        display: "block",
        fontSize: "8px",
        lineHeight: 1.1,
        color: "rgba(255,255,255,0.82)",
        textAlign: "left",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        padding: 0,
    },

    subLabelMuted: {
        display: "block",
        fontSize: "8px",
        lineHeight: 1.1,
        color: "rgba(255,255,255,0.38)",
        textAlign: "left",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        padding: 0,
    },

    labelTone: (tone: TrainingStatusTone): CSSProperties => ({
        color:
            tone === "danger"
                ? "#ff9f9f"
                : tone === "warning"
                    ? "#f7d978"
                    : tone === "success"
                        ? "#87f0ac"
                        : "rgba(255,255,255,0.82)",
    }),
};
