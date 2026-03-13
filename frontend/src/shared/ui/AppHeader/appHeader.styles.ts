// frontend/src/shared/ui/AppHeader/appHeader.styles.ts
import type { CSSProperties } from "react";

export const appHeaderStyles: Record<string, CSSProperties> = {
    header: {
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,

        background: "transparent",
        borderBottom: "none",
        boxShadow: "none",

        color: "#e6edf3",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    },

    sideSlot: {
        width: 40,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 40px",
    },

    backBtn: {
        width: 40,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        padding: 0,
        fontSize: 20,
        cursor: "pointer",
        borderRadius: 10,
        color: "inherit",
    },

    title: {
        flex: 1,
        textAlign: "center",
        fontWeight: 800,
        fontSize: 18,
        letterSpacing: 0.2,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        padding: "0 8px",
        color: "inherit",
    },
};