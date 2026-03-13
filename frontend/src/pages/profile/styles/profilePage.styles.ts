// frontend/src/pages/profile/styles/profilePage.styles.ts

export const profilePageStyles = {
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
    } as const,

    card: {
        padding: 14,
        borderRadius: 14,
        border: "1px solid #e6e6e6",
        background: "#ffffff",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    } as const,

    cardTitle: {
        fontSize: 12,
        fontWeight: 800,
        color: "#8a8a8a",
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginBottom: 10,
    } as const,

    row: {
        marginTop: 8,
        fontSize: 14,
        color: "#111111",
    } as const,

    rowMuted: {
        marginTop: 8,
        fontSize: 13,
        color: "#8a8a8a",
    } as const,

    value: {
        fontWeight: 800,
        marginLeft: 8,
        color: "#0088cc",
    } as const,
};
