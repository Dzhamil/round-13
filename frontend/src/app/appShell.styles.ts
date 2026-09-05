// frontend/src/app/appShell.styles.ts
import type { CSSProperties } from "react";

export const appShellStyles: Record<string, CSSProperties> = {
    root: {
        position: "relative",
        isolation: "isolate",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",

        // Глобальный тёмный фон
        background: "radial-gradient(circle at 50% 20%, #1f2a3a 0%, #0f1723 55%, #0b1220 100%)",

        color: "#e6edf3",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    },

    rootHome: {
        position: "relative",
        isolation: "isolate",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        color: "#e6edf3",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    },

    content: {
        position: "relative",
        zIndex: 1,
        flex: 1,
        padding: "8px 12px",
        boxSizing: "border-box" as const,
    },

    contentFullBleed: {
        position: "relative",
        zIndex: 1,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
    },

    nav: {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        background: "rgba(15, 23, 35, 0.95)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
    },

    navItem: {
        padding: "12px 6px",
        textAlign: "center",
        textDecoration: "none",
        fontSize: 11,
        letterSpacing: 0.2,
        color: "#7aa7ff",
    },

    navItemActive: {
        fontWeight: 900,
        color: "#4ea1ff",
    },
};
