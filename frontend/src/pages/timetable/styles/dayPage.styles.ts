// frontend/src/pages/timetable/styles/dayPage.styles.ts

import type { CSSProperties } from "react";

export const dayPageStyles: Record<string, CSSProperties> = {
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "auto",
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

    scheduleItem: {
        position: "absolute",
        left: "64px",
        right: "4px",
        background: "rgba(36,47,61,0.94)",
        border: "1px solid rgba(42,171,238,0.35)",
        borderRadius: "10px",
        padding: "8px 12px",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "3px",
        textAlign: "left",
    },

    scheduleItemTime: {
        fontSize: "13px",
        fontWeight: 600,
    },

    scheduleItemName: {
        fontSize: "13px",
        lineHeight: 1.25,
    },
};
