// frontend/src/pages/profile/styles/completeProfilePage.styles.ts
export const completeProfilePageStyles = {
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 720,
        margin: "0 auto",
        padding: 16,
    },

    topRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    },

    titleBlock: { flex: 1, minWidth: 0 },

    title: {
        fontWeight: 900,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: "var(--tg-theme-link-color, #62b0ff)",
        fontSize: 20,
        lineHeight: 1.1,
    },

    subtitle: {
        marginTop: 6,
        color: "var(--tg-theme-hint-color, rgba(230,237,243,0.68))",
        fontSize: 12,
        letterSpacing: 0.3,
    },

    avatarBox: {
        width: 84,
        height: 84,
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.96) 0%, rgba(24,33,43,0.96) 100%)",
        boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
    },

    avatarImg: { width: "100%", height: "100%", objectFit: "cover" },

    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        fontWeight: 900,
        color: "var(--tg-theme-hint-color, rgba(230,237,243,0.68))",
        fontSize: 11,
        letterSpacing: 1.0,
    },

    panel: {
        padding: 12,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.96) 0%, rgba(24,33,43,0.96) 100%)",
        boxShadow: "0 16px 32px rgba(0,0,0,0.22)",
        overflow: "hidden",
    },

    field: { marginTop: 10, minWidth: 0 },

    label: {
        fontSize: 11,
        letterSpacing: 0.5,
        color: "var(--tg-theme-hint-color, rgba(230,237,243,0.68))",
        marginBottom: 6,
        textTransform: "uppercase",
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        minWidth: 0,
        padding: "10px 10px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "var(--tg-theme-bg-color, #18212b)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
        outline: "none",
        fontFamily: "inherit",
    },

    help: {
        marginTop: 6,
        fontSize: 11,
        color: "var(--tg-theme-hint-color, rgba(230,237,243,0.68))",
        lineHeight: 1.35,
    },

    genderRow: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
        minWidth: 0,
    },

    radio: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "var(--tg-theme-bg-color, #18212b)",
        cursor: "pointer",
        userSelect: "none",
    },

    radioText: {
        fontWeight: 900,
        letterSpacing: 0.5,
        color: "var(--tg-theme-link-color, #62b0ff)",
    },

    checkbox: {
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "10px 10px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "var(--tg-theme-bg-color, #18212b)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
        cursor: "pointer",
        userSelect: "none",
        lineHeight: 1.35,
    },

    checkboxText: {
        minWidth: 0,
        fontSize: 13,
        fontWeight: 700,
    },
} as const;
