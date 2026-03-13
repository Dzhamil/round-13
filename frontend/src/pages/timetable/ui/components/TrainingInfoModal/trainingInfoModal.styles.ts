// frontend/src/pages/timetable/ui/components/TrainingInfoModal/trainingInfoModal.styles.ts

import type { CSSProperties } from "react";

export const trainingInfoModalStyles: Record<string, CSSProperties> = {

    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },

    modal: {
        width: "92%",
        maxWidth: "420px",
        background: "#17212b",
        borderRadius: "14px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },

    title: {
        fontSize: "18px",
        fontWeight: 600,
        color: "#fff",
    },

    row: {
        fontSize: "16px",
        color: "#fff",
    },

    actions: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "12px",
    },

    requestCancel: {
        background: "#2AABEE",
        border: "none",
        borderRadius: "8px",
        padding: "8px 16px",
        color: "#fff",
        cursor: "pointer",
    },

    close: {
        background: "transparent",
        border: "none",
        color: "#aaa",
        cursor: "pointer",
    },

};