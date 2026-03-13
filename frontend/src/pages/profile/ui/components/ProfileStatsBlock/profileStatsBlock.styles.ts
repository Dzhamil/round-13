// frontend/src/pages/profile/ui/components/ProfileStatsBlock/profileStatsBlock.styles.ts

export const profileStatsBlockStyles = {
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
    } as const,

    caption: {
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        color: "#8a8a8a",
    } as const,

    grid: {
        display: "grid",
        gap: 10,
    } as const,

    row: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 14,
        borderRadius: 14,
        border: "1px solid #e6e6e6",
        background: "#ffffff",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    } as const,

    rowLabel: {
        fontSize: 14,
        color: "#111111",
        opacity: 0.9,
    } as const,

    rowValue: {
        fontSize: 16,
        fontWeight: 900,
        color: "#0088cc",
    } as const,
};
