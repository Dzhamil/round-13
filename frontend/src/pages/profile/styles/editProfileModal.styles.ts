// frontend/src/pages/profile/styles/editProfileModal.styles.ts
export const editProfileModalStyles = {
    backdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
        padding: 14,
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

        borderRadius: 16,
        border: "1px solid #e6e6e6",
        background: "#ffffff",
        boxShadow: "0 18px 45px rgba(0,0,0,0.22)",
        padding: 14,
        color: "#111111",

        // Telegram-light: обычный системный шрифт, не моноширинный
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        boxSizing: "border-box",
    },

    title: {
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: "#0088cc",
        marginBottom: 10,
    },

    row: { marginTop: 12 },

    label: {
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        color: "#777777",
        marginBottom: 6,
        fontWeight: 800,
    },

    input: {
        width: "100%",
        padding: "11px 12px",
        borderRadius: 12,
        border: "1px solid #e0e0e0",
        background: "#f5f5f5",
        color: "#111111",
        outline: "none",
        boxSizing: "border-box",
    },

    help: {
        marginTop: 6,
        fontSize: 12,
        color: "#8a8a8a",
        lineHeight: 1.35,
    },

    genderRow: { display: "flex", gap: 10, flexWrap: "wrap" },

    radio: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 12px",
        borderRadius: 12,
        border: "1px solid #e0e0e0",
        background: "#f5f5f5",
        cursor: "pointer",
        userSelect: "none",
    },

    radioText: {
        fontWeight: 900,
        letterSpacing: 0.4,
        color: "#0088cc",
    },

    avatarRow: { display: "flex", gap: 12, alignItems: "center" },

    avatarBox: {
        width: 72,
        height: 72,
        borderRadius: 14,
        border: "1px solid #e6e6e6",
        overflow: "hidden",
        background: "#f0f0f0",
        boxShadow: "0 10px 22px rgba(0,0,0,0.10)",
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
        color: "#8a8a8a",
    },

    actions: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginTop: 14,
        paddingBottom: 4,
    },
} as const;
