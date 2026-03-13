// frontend/src/pages/profile/styles/birthDateSelect.styles.ts

export const birthDateSelectStyles = {
    root: {
        marginTop: 0,
        minWidth: 0,
    },

    label: {
        fontSize: 11,
        letterSpacing: "0.08em",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.52))",
        marginBottom: 6,
        textTransform: "uppercase",
        fontWeight: 800,
    },

    help: {
        marginTop: 6,
        fontSize: 12,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
        lineHeight: 1.35,
    },

    row: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1.2fr",
        gap: 8,
        minWidth: 0,
    },

    select: {
        width: "100%",
        boxSizing: "border-box",
        minWidth: 0,
        padding: "11px 12px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "var(--tg-theme-bg-color, #18212b)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
        outline: "none",
        fontFamily: "inherit",
    },
} as const;
