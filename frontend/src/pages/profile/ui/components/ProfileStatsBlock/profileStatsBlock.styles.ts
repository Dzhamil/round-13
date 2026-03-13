// frontend/src/pages/profile/ui/components/ProfileStatsBlock/profileStatsBlock.styles.ts

export const profileStatsBlockStyles = {
    root: {
        display: "grid",
        gap: 10,
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.96) 0%, rgba(24,33,43,0.96) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
    } as const,

    caption: {
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.52))",
    } as const,

    grid: {
        display: "grid",
        gap: 8,
    } as const,

    row: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.04)",
    } as const,

    rowLabel: {
        fontSize: 13,
        color: "var(--tg-theme-text-color, #f5f5f5)",
        opacity: 0.92,
    } as const,

    rowValue: {
        fontSize: 14,
        fontWeight: 900,
        color: "var(--tg-theme-button-color, #62b0ff)",
    } as const,
};
