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
        gap: "4px",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
    },

    weekDayColumn: {
        border: "none",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        userSelect: "none",
    },

    weekDayLabel: {
        fontSize: "12px",
        fontWeight: 600,
        color: "rgba(255,255,255,0.55)",
        textTransform: "uppercase",
    },

    weekDayNumber: {
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "18px",
        fontSize: "16px",
        color: "rgba(255,255,255,0.85)",
        border: "1px solid transparent",
        boxSizing: "border-box",
    },

    weekDayNumberToday: {
        backgroundColor: "#D70037",
        color: "#fff",
    },

    weekDayNumberSelected: {
        border: "1px solid #ffffff",
    },

    scheduleWrap: {
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },

    scheduleGrid: {
        position: "relative",
        minHeight: "1140px",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
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
        height: "60px",
        display: "flex",
        alignItems: "center",
        paddingLeft: "16px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        fontSize: "16px",
        boxSizing: "border-box",
    },

    rowTime: {
        width: "48px",
        fontSize: "14px",
        color: "rgba(255,255,255,0.5)",
    },

    scheduleItem: {
        position: "absolute",
        left: "76px",
        right: "12px",
        background: "#242f3d",
        border: "1px solid rgba(42,171,238,0.42)",
        borderRadius: "12px",
        padding: "8px 12px",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        textAlign: "left",
    },

    scheduleItemTime: {
        fontSize: "14px",
        fontWeight: 600,
    },

    scheduleItemName: {
        fontSize: "14px",
    },
};
