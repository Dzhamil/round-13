export const usersTableStyles = {
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    headerRow: {
        display: "grid",
        gridTemplateColumns: "220px 1fr 110px 110px 220px",
        gap: 8,
        fontSize: 12,
        opacity: 0.7,
        padding: "0 0 6px 0",
    },
    row: {
        display: "grid",
        gridTemplateColumns: "220px 1fr 110px 110px 220px",
        gap: 8,
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
    },
    colId: { fontSize: 12, wordBreak: "break-all" },
    colMain: { fontSize: 14 },
    subText: { fontSize: 12, opacity: 0.7 },
    colRole: { fontSize: 13 },
    colStatus: { fontSize: 13 },
    colActions: { display: "flex" },
} as const;
