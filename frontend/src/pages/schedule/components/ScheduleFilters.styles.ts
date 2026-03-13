export const scheduleFiltersStyles = {
    root: {
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
    } as const,

    stack: {
        display: "grid",
        gap: 12,
    } as const,

    row2: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
    } as const,

    select: {
        width: "100%",
        padding: 12,
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.15)",
        background: "white",
    } as const,

    dateTime: {
        width: "100%",
        padding: 12,
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.15)",
    } as const,

    actions: {
        display: "grid",
        gap: 8,
    } as const,
};
