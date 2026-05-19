// frontend/src/shared/ui/AppHeader/appHeader.styles.ts
import type { CSSProperties } from "react";

export const appHeaderStyles: Record<string, CSSProperties> = {
    header: {
        position: "sticky",
        top: 0,
        zIndex: 30,
        padding: "calc(env(safe-area-inset-top, 0px) + 10px) 16px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,

        background: "linear-gradient(180deg, rgba(15,23,35,0.98) 0%, rgba(15,23,35,0.86) 82%, rgba(15,23,35,0) 100%)",
        borderBottom: "none",
        boxShadow: "none",

        color: "#e6edf3",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    },

    sideSlot: {
        width: 44,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 44px",
    },

    backBtn: {
        width: 44,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 0,
        fontSize: 22,
        lineHeight: 1,
        cursor: "pointer",
        borderRadius: 12,
        color: "inherit",
        touchAction: "manipulation",
        flex: "0 0 44px",
    },

    title: {
        flex: 1,
        textAlign: "center",
        fontWeight: 800,
        fontSize: 18,
        letterSpacing: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        padding: "0 8px",
        color: "inherit",
    },
};
