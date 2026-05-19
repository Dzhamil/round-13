// frontend/src/pages/profile/styles/profilePage.styles.ts

export const profilePageStyles = {
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        paddingBottom: 22,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    } as const,

    status: {
        padding: 16,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.96) 0%, rgba(24,33,43,0.96) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
    } as const,

    hero: {
        display: "grid",
        gap: 12,
        padding: 16,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.96) 0%, rgba(24,33,43,0.96) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
    } as const,

    toolbar: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
    } as const,

    toolbarItem: {
        flex: "1 1 180px",
    } as const,

    cardGrid: {
        display: "grid",
        gap: 12,
    } as const,

    card: {
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.96) 0%, rgba(24,33,43,0.96) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
    } as const,

    sectionHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 10,
    } as const,

    cardTitle: {
        fontSize: 11,
        fontWeight: 800,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.52))",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    } as const,

    rows: {
        display: "grid",
        gap: 8,
    } as const,

    row: {
        display: "grid",
        gap: 4,
        padding: "10px 12px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
    } as const,

    rowLabel: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.5))",
    } as const,

    rowValue: {
        fontSize: 13,
        lineHeight: 1.4,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    } as const,

    rowMuted: {
        fontSize: 12,
        lineHeight: 1.4,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
    } as const,

    cardNote: {
        marginTop: 10,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
        fontSize: 12,
        lineHeight: 1.45,
    } as const,
};
