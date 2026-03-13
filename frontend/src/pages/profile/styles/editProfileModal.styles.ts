// frontend/src/pages/profile/styles/editProfileModal.styles.ts
export const editProfileModalStyles = {
    backdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(3, 8, 20, 0.72)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
        padding: 14,
        backdropFilter: "blur(12px)",
        // чтобы на iOS/мобиле не “прыгало” при скролле внутри
        overscrollBehavior: "contain",
    },

    modal: {
        width: "100%",
        maxWidth: 520,

        // главное: не вылезаем за экран
        maxHeight: "calc(100vh - 28px)",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",

        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.98) 0%, rgba(24,33,43,0.98) 100%)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.34)",
        padding: 18,
        color: "var(--tg-theme-text-color, #f5f5f5)",

        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        boxSizing: "border-box",
    },

    title: {
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--tg-theme-button-color, #62b0ff)",
        marginBottom: 12,
    },

    row: { marginTop: 12 },

    label: {
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.52))",
        marginBottom: 6,
        fontWeight: 800,
    },

    input: {
        width: "100%",
        padding: "11px 12px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "var(--tg-theme-bg-color, #18212b)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
        outline: "none",
        boxSizing: "border-box",
    },

    textarea: {
        width: "100%",
        minHeight: 120,
        padding: "11px 12px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "var(--tg-theme-bg-color, #18212b)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
        outline: "none",
        boxSizing: "border-box",
        resize: "vertical" as const,
        lineHeight: 1.5,
        fontFamily: "inherit",
    },

    help: {
        marginTop: 6,
        fontSize: 12,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
        lineHeight: 1.35,
    },

    genderRow: { display: "flex", gap: 10, flexWrap: "wrap" },

    radio: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 12px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        cursor: "pointer",
        userSelect: "none",
    },

    radioText: {
        fontWeight: 900,
        letterSpacing: 0.4,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    },

    avatarRow: { display: "flex", gap: 12, alignItems: "center" },

    avatarBox: {
        width: 72,
        height: 72,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        background: "rgba(255,255,255,0.06)",
        boxShadow: "0 18px 36px rgba(0,0,0,0.24)",
        flexShrink: 0,
    },

    avatarImg: { width: "100%", height: "100%", objectFit: "cover" },

    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        fontWeight: 900,
        fontSize: 11,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
    },

    actions: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginTop: 14,
        paddingBottom: 4,
    },
} as const;
