// frontend/src/pages/timetable/ui/components/CreateTrainingModal/createTrainingModal.styles.ts

import type { CSSProperties } from "react"

export const createTrainingModalStyles: Record<string, CSSProperties> = {

    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
    },

    modal: {
        width: "calc(100vw - 16px)",
        maxWidth: "520px",
        maxHeight: "86vh",
        overflowY: "auto",
        background: "#17212b",
        borderRadius: "14px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },

    title: {
        fontSize: "18px",
        fontWeight: 600,
        color: "#fff"
    },

    date: {
        fontSize: "13px",
        color: "#708499"
    },

    fieldWrap: {
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },

    comboWrap: {
        position: "relative"
    },

    fieldLabel: {
        fontSize: "13px",
        color: "#9eb1c5"
    },

    fieldInput: {
        background: "#242f3d",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px",
        padding: "10px",
        color: "#fff",
        minHeight: "42px",
        boxSizing: "border-box"
    },

    dropdown: {
        position: "absolute",
        top: "calc(100% + 6px)",
        left: 0,
        right: 0,
        zIndex: 4
    },

    dropdownItem: {
        width: "100%",
        display: "block",
        textAlign: "left",
        background: "#1f2a36",
        color: "#f5f5f5",
        border: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "none",
        padding: "11px 12px",
        cursor: "pointer",
        boxSizing: "border-box",
        backdropFilter: "blur(12px)"
    },

    dropdownItemActive: {
        background: "#2b3b4c",
        color: "#6ab3f3"
    },

    dropdownEmpty: {
        background: "#1f2a36",
        color: "#708499",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "10px",
        padding: "11px 12px",
        fontSize: "13px",
        backdropFilter: "blur(12px)"
    },

    error: {
        fontSize: "13px",
        color: "#ff7f96"
    },

    actions: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "8px"
    },

    cancel: {
        background: "transparent",
        border: "none",
        color: "#aaa",
        cursor: "pointer"
    },

    create: {
        background: "#2AABEE",
        border: "none",
        borderRadius: "8px",
        padding: "8px 16px",
        color: "#fff",
        cursor: "pointer"
    }

}
