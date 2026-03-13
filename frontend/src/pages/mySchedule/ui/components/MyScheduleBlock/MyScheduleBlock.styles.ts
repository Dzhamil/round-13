// frontend/src/pages/mySchedule/ui/components/MyScheduleBlock/MyScheduleBlock.styles.ts

export const myScheduleBlockStyles = {
    root: {
        marginTop: 16,
    } as const,

    title: {
        margin: 0,
        marginBottom: 8,
        fontSize: 16,
        fontWeight: 700,
    } as const,

    hint: {
        opacity: 0.7,
    } as const,

    list: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    } as const,

    errorWrap: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    } as const,

    retryButton: {
        alignSelf: "flex-start",
        marginTop: 8,
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #e5e5e5",
        background: "transparent",
        cursor: "pointer",
        fontSize: 14,
    } as const,
};
