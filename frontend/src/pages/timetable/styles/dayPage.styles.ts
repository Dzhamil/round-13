// frontend/src/pages/timetable/styles/dayPage.styles.ts

import type { CSSProperties } from "react";
import type { TrainingStatusTone } from "../model/trainingStatusTone";

export const dayPageStyles: Record<string, any> = {
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "auto",
    },

    topBar: {
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "#17212b",
        boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
    },

    header: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        fontSize: "18px",
        fontWeight: 700,
        borderBottom: "1px solid rgba(255,255,255,0.15)",
    },

    back: {
        border: "none",
        background: "transparent",
        color: "#fff",
        fontSize: "20px",
        cursor: "pointer",
    },

    weekRow: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 0,
        padding: "0 16px",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
    },

    weekDayColumn: {
        border: "none",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        minHeight: "84px",
        padding: "10px 0 12px",
        cursor: "pointer",
        userSelect: "none",
    },

    weekDayColumnWithDivider: {
        borderLeft: "1px solid rgba(255,255,255,0.08)",
    },

    weekDayColumnSelected: {
        background: "rgba(255,255,255,0.04)",
    },

    weekDayLabel: {
        fontSize: "11px",
        fontWeight: 600,
        color: "rgba(255,255,255,0.55)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
    },

    weekDayLabelToday: {
        color: "rgba(255,255,255,0.78)",
    },

    weekDayLabelSelected: {
        color: "rgba(255,255,255,0.9)",
    },

    weekDayNumber: {
        fontSize: "16px",
        color: "rgba(255,255,255,0.85)",
        fontWeight: 500,
        lineHeight: 1,
    },

    weekDayNumberToday: {
        color: "#D70037",
        fontWeight: 700,
    },

    weekDayNumberSelected: {
        color: "#ffffff",
        fontWeight: 700,
    },

    scheduleWrap: {
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },

    scheduleGrid: {
        position: "relative",
        overflow: "visible",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "transparent",
    },

    scheduleLoading: {
        fontSize: "14px",
        color: "#708499",
    },

    scheduleEmpty: {
        fontSize: "14px",
        color: "#708499",
    },

    row: {
        display: "flex",
        alignItems: "center",
        paddingLeft: "8px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxSizing: "border-box",
    },

    rowTime: {
        width: "56px",
        fontSize: "13px",
        fontWeight: 500,
        color: "rgba(255,255,255,0.42)",
    },

    scheduleItem: (tone: TrainingStatusTone): CSSProperties => ({
        position: "absolute",
        left: "64px",
        right: "4px",
        background:
            tone === "danger"
                ? "rgba(255,107,107,0.10)"
                : tone === "warning"
                    ? "rgba(247,201,72,0.12)"
                    : tone === "success"
                        ? "rgba(67,209,122,0.12)"
                        : "rgba(255,255,255,0.04)",
        border:
            tone === "danger"
                ? "1px solid rgba(255,107,107,0.24)"
                : tone === "warning"
                    ? "1px solid rgba(247,201,72,0.28)"
                    : tone === "success"
                        ? "1px solid rgba(67,209,122,0.24)"
                        : "1px solid rgba(255,255,255,0.08)",
        borderLeft:
            tone === "danger"
                ? "3px solid rgba(255,107,107,0.9)"
                : tone === "warning"
                    ? "3px solid rgba(247,201,72,0.92)"
                    : tone === "success"
                        ? "3px solid rgba(67,209,122,0.92)"
                        : "3px solid rgba(42,171,238,0.6)",
        borderRadius: "8px",
        padding: "6px 10px 6px 12px",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        textAlign: "left",
    }),

    scheduleItemName: {
        fontSize: "13px",
        lineHeight: 1.25,
        fontWeight: 600,
        color: "rgba(255,255,255,0.92)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
};
