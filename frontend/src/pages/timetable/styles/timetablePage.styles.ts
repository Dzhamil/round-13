// frontend/src/pages/timetable/styles/timetablePage.styles.ts
import type { CSSProperties } from "react";

export const timetablePageStyles: Record<string, CSSProperties> = {
    root: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        overflowY: "auto",
        background: "#17212b",
        color: "#f5f5f5",
    },

    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        fontSize: "18px",
        fontWeight: 700,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "#17212b",
    },

    navButton: {
        background: "transparent",
        border: "none",
        color: "#fff",
        fontSize: "24px",
        cursor: "pointer",
        width: "32px",
        height: "32px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        flex: 1,
        textAlign: "center",
        color: "#fff",
        fontSize: "16px",
        textTransform: "capitalize",
    },

    placeholder: {
        padding: "20px 16px",
        color: "#708499",
        fontSize: "14px",
    },
};