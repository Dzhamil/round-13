// frontend/src/pages/schedule/schedulePage.styles.ts
import type { CSSProperties } from "react";

export const schedulePageStyles: Record<string, CSSProperties> = {
    root: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        maxWidth: "760px",
        margin: "0 auto",
        padding: "8px 0 28px",
        minHeight: "100%",
        color: "var(--tg-theme-text-color, #f5f5f5)",
    },

    header: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
    },

    headerCopy: {
        display: "grid",
        gap: "4px",
    },

    headerTitle: {
        margin: 0,
        fontSize: "24px",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: "var(--tg-theme-text-color, #f5f5f5)",
    },

    headerSubtitle: {
        margin: 0,
        fontSize: "14px",
        lineHeight: 1.45,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
    },

    grid: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },

    empty: {
        textAlign: "center",
        padding: "24px 20px",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.96) 0%, rgba(24,33,43,0.96) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
        fontSize: "14px",
        lineHeight: 1.5,
    },

    modalBackdrop: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "20px 12px",
        background: "rgba(3, 8, 20, 0.72)",
        backdropFilter: "blur(12px)",
    },

    modal: {
        width: "100%",
        maxWidth: "520px",
        padding: "20px",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.98) 0%, rgba(24,33,43,0.98) 100%)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.34)",
    },

    modalHeader: {
        display: "grid",
        gap: "14px",
        marginBottom: "18px",
    },

    modalTopRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "12px",
        flexWrap: "wrap",
    },

    modalTitle: {
        margin: 0,
        fontSize: "22px",
        fontWeight: 800,
        lineHeight: 1.15,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    },

    modalBadgeRow: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
    },

    modalBadge: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "30px",
        padding: "6px 10px",
        borderRadius: "999px",
        border: "1px solid rgba(46,166,255,0.28)",
        background: "rgba(46,166,255,0.14)",
        color: "var(--tg-theme-button-color, #62b0ff)",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
    },

    modalDescription: {
        margin: 0,
        fontSize: "14px",
        lineHeight: 1.55,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.74))",
    },

    modalStatsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "10px",
    },

    modalStatCard: {
        display: "grid",
        gap: "6px",
        padding: "12px 14px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
    },

    modalStatLabel: {
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.5))",
    },

    modalStatValue: {
        fontSize: "14px",
        lineHeight: 1.4,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    },
};
