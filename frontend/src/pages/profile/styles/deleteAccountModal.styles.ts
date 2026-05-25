export const deleteAccountModalStyles = {
    backdrop: {
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        zIndex: 60,
        padding: 14,
        background: "rgba(3, 8, 20, 0.76)",
        backdropFilter: "blur(12px)",
        overscrollBehavior: "contain",
    },

    modal: {
        width: "100%",
        maxWidth: 520,
        maxHeight: "calc(100vh - 28px)",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        boxSizing: "border-box",
        padding: 18,
        borderRadius: 22,
        border: "1px solid rgba(239,68,68,0.22)",
        background: "linear-gradient(180deg, rgba(42,45,56,0.98) 0%, rgba(24,33,43,0.98) 100%)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.34)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },

    title: {
        marginBottom: 10,
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#fecaca",
    },

    text: {
        margin: "0 0 10px",
        fontSize: 13,
        lineHeight: 1.45,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    },

    list: {
        display: "grid",
        gap: 8,
        margin: "12px 0",
        padding: 0,
        listStyle: "none",
    },

    item: {
        padding: "9px 11px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        fontSize: 12,
        lineHeight: 1.4,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.76))",
    },

    checkboxLabel: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        marginTop: 14,
        padding: "11px 12px",
        borderRadius: 14,
        border: "1px solid rgba(239,68,68,0.28)",
        background: "rgba(239,68,68,0.08)",
        cursor: "pointer",
        userSelect: "none",
    },

    checkbox: {
        width: 18,
        height: 18,
        marginTop: 1,
        flexShrink: 0,
        accentColor: "#ef4444",
    },

    checkboxText: {
        minWidth: 0,
        fontSize: 12,
        lineHeight: 1.4,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    },

    actions: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: 10,
        marginTop: 14,
        paddingBottom: 4,
    },
} as const;
