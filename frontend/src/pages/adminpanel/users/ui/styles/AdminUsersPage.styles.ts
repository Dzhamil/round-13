export const adminUsersPageStyles = {
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "16px 14px",
    },
    header: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
    },
    title: {
        margin: 0,
        fontSize: 18,
    },
    loading: {
        fontSize: 12,
        opacity: 0.7,
    },
} as const;
