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
        color: "#0088cc",
        fontSize: 20,
        lineHeight: 1.1,
    },

    subtitle: {
        marginTop: 6,
        color: "#777777",
        fontSize: 12,
        letterSpacing: 0.3,
    },

    avatarBox: {
        width: 84,
        height: 84,
        borderRadius: 8,
        border: "1px solid #e6e6e6",
        background: "#f5f5f5",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
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
        color: "#8a8a8a",
        fontSize: 11,
        letterSpacing: 1.0,
    },

    panel: {
        padding: 12,
        borderRadius: 12,
        border: "1px solid #e6e6e6",
        background: "#ffffff",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        overflow: "hidden",
    },

    field: { marginTop: 10, minWidth: 0 },

    label: {
        fontSize: 11,
        letterSpacing: 0.5,
        color: "#777777",
        marginBottom: 6,
        textTransform: "uppercase",
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        minWidth: 0,
        padding: "10px 10px",
        borderRadius: 10,
        border: "1px solid #e0e0e0",
        background: "#f5f5f5",
        color: "#111111",
        outline: "none",
        fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },

    help: {
        marginTop: 6,
        fontSize: 11,
        color: "#8a8a8a",
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
        border: "1px solid #e0e0e0",
        background: "#f5f5f5",
        cursor: "pointer",
        userSelect: "none",
    },

    radioText: {
        fontWeight: 900,
        letterSpacing: 0.5,
        color: "#0088cc",
    },
} as const;
