// frontend/src/pages/schedule/components/scheduleTile.styles.ts
import type { CSSProperties } from "react";

export const scheduleTileStyles: Record<string, CSSProperties> = {
    card: {
        background: "#ffffff",
        borderRadius: "14px",
        padding: "16px",
        border: "1px solid #e6e6e6",
        boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    title: {
        fontWeight: 600,
        fontSize: "15px",
        color: "#111",
    },

    date: {
        fontSize: "13px",
        color: "#8e8e93",
    },

    time: {
        fontSize: "14px",
        color: "#4ea3ff",
        fontWeight: 500,
    },

    description: {
        fontSize: "14px",
        color: "#333",
        lineHeight: 1.4,
    },
};
