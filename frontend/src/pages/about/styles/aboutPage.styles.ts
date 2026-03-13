// frontend/src/pages/about/aboutPage.styles.ts
import type { CSSProperties } from "react";

export const aboutPageStyles: Record<string, CSSProperties> = {
    root: {
        display: "flex",
        justifyContent: "center",
        padding: "16px",
    },

    card: {
        width: "100%",
        maxWidth: "640px",
        background: "#ffffff",
        borderRadius: "14px",
        padding: "20px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
        border: "1px solid #e6e6e6",
    },

    text: {
        fontSize: "15px",
        lineHeight: 1.6,
        color: "#222",
    },

    editButton: {
        marginTop: "16px",
        background: "#4ea3ff",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        padding: "10px 16px",
        fontWeight: 600,
        cursor: "pointer",
    },

    textarea: {
        width: "100%",
        minHeight: "160px",
        borderRadius: "10px",
        border: "1px solid #d0d7de",
        padding: "12px",
        fontSize: "14px",
        resize: "vertical",
    },

    actions: {
        display: "flex",
        gap: "10px",
        marginTop: "12px",
    },

    saveButton: {
        background: "#4ea3ff",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        padding: "8px 14px",
        fontWeight: 600,
        cursor: "pointer",
    },

    cancelButton: {
        background: "#f3f3f3",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "8px 14px",
        cursor: "pointer",
    },
};
