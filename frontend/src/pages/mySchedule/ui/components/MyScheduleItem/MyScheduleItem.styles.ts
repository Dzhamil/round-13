// frontend/src/pages/mySchedule/ui/components/MyScheduleItem/MyScheduleItem.styles.ts

export const myScheduleItemStyles = {
    card: {
        padding: 12,
        borderRadius: 8,
        border: "1px solid #e5e5e5",
    } as const,

    title: {
        fontWeight: 600,
    } as const,

    meta: {
        fontSize: 13,
        opacity: 0.7,
    } as const,

    row: {
        fontSize: 13,
    } as const,

    status: {
        marginTop: 8,
        fontSize: 12,
        opacity: 0.75,
    } as const,

    actions: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: 10,
    } as const,

    cancelButton: {
        height: 34,
        padding: "0 12px",
        borderRadius: 8,
        border: "1px solid rgba(201,58,58,0.32)",
        background: "rgba(201,58,58,0.12)",
        color: "#b62323",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
    } as const,
};
