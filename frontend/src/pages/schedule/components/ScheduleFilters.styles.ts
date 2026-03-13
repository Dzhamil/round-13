export const scheduleFiltersStyles = {
    root: {
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(35,46,60,0.94) 0%, rgba(24,33,43,0.94) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
    } as const,

    stack: {
        display: "grid",
        gap: 14,
    } as const,

    row2: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
    } as const,

    select: {
        width: "100%",
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "var(--tg-theme-bg-color, #18212b)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
        outline: "none",
    } as const,

    dateTime: {
        width: "100%",
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "var(--tg-theme-bg-color, #18212b)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
        outline: "none",
    } as const,

    textInput: {
        width: "100%",
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "var(--tg-theme-bg-color, #18212b)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
        outline: "none",
    } as const,

    actions: {
        display: "grid",
        gap: 8,
    } as const,
};
