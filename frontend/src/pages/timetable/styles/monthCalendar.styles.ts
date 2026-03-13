// frontend/src/pages/timetable/styles/monthCalendar.styles.ts
import type { CSSProperties } from "react";

export const monthCalendarStyles: Record<string, CSSProperties> = {
    weekdaysRow: {
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: "6px",
        padding: "12px 12px 6px",
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
        gap: "6px",
        padding: "8px 12px 16px",
    },

    cell: {
        minHeight: "68px",
        padding: "6px 4px",
        borderRadius: "14px",
        cursor: "pointer",
        userSelect: "none",
        border: "1px solid transparent",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        background: "rgba(255,255,255,0.02)",
        minWidth: 0,
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
        border: "1px solid rgba(255,255,255,0.9)",
    },

    cellHeader: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "24px",
        marginBottom: "4px",
    },

    dayNumber: {
        width: "26px",
        height: "26px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "13px",
        fontSize: "14px",
        lineHeight: 1,
    },

    dayNumberToday: {
        backgroundColor: "#D70037",
        color: "#fff",
    },

    dayNumberSelected: {
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.95)",
    },

    dot: {
        position: "absolute",
        top: "1px",
        right: "8px",
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#6ab3f3",
        boxShadow: "0 0 0 2px rgba(23,33,43,0.9)",
    },

    labelsWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "2px",
        minWidth: 0,
    },

    subLabel: {
        display: "block",
        fontSize: "9px",
        lineHeight: 1.2,
        color: "rgba(255,255,255,0.82)",
        textAlign: "center",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        padding: "0 2px",
    },

    subLabelMuted: {
        display: "block",
        fontSize: "9px",
        lineHeight: 1.2,
        color: "rgba(255,255,255,0.38)",
        textAlign: "center",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        padding: "0 2px",
    },
};