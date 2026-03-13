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
        position: "relative",
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
        flexDirection: "column",
        gap: "8px",
        marginTop: "12px",
    },

    requestCancel: {
        background: "#2AABEE",
        border: "none",
        borderRadius: "8px",
        padding: "8px 16px",
        color: "#fff",
        cursor: "pointer",
        width: "100%",
    },

    dangerButton: {
        background: "rgba(215, 0, 55, 0.22)",
        border: "1px solid rgba(215, 0, 55, 0.45)",
        borderRadius: "8px",
        padding: "8px 16px",
        color: "#fff",
        cursor: "pointer",
        width: "100%",
    },

    close: {
        position: "absolute",
        top: "12px",
        right: "12px",
        width: "30px",
        height: "30px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(215, 0, 55, 0.14)",
        border: "1px solid rgba(215, 0, 55, 0.45)",
        borderRadius: "999px",
        color: "#ff4d6d",
        fontSize: "20px",
        lineHeight: 1,
        cursor: "pointer",
    },

};
