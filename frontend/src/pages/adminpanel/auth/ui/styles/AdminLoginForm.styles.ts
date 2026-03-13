export const adminLoginFormStyles = {
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    title: {
        margin: "0 0 8px 0",
        fontSize: 18,
    },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontSize: 14,
    },
    input: {
        height: 40,
        padding: "0 12px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.12)",
        outline: "none",
    },
} as const;
