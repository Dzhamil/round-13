// frontend/src/pages/profile/styles/profilePage.styles.ts

export const profilePageStyles = {
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
        paddingBottom: 28,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    } as const,

    status: {
        padding: 20,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.96) 0%, rgba(24,33,43,0.96) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
    } as const,

    hero: {
        display: "grid",
        gap: 16,
        padding: 18,
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.96) 0%, rgba(24,33,43,0.96) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
    } as const,

    toolbar: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
    } as const,

    toolbarItem: {
        flex: "1 1 220px",
    } as const,

    cardGrid: {
        display: "grid",
        gap: 14,
    } as const,

    card: {
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.96) 0%, rgba(24,33,43,0.96) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
    } as const,

    sectionHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
    } as const,

    cardTitle: {
        fontSize: 12,
        fontWeight: 800,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.52))",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    } as const,

    rows: {
        display: "grid",
        gap: 10,
    } as const,

    row: {
        display: "grid",
        gap: 4,
        padding: "12px 14px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
    } as const,

    rowLabel: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.5))",
    } as const,

    rowValue: {
        fontSize: 14,
        lineHeight: 1.45,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    } as const,

    rowMuted: {
        fontSize: 13,
        lineHeight: 1.45,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
    } as const,
};
