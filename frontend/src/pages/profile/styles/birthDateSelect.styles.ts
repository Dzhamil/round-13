// frontend/src/pages/profile/styles/birthDateSelect.styles.ts

export const birthDateSelectStyles = {
    root: {
        marginTop: 0,
        minWidth: 0,
    },

    label: {
        fontSize: 11,
        letterSpacing: 0.6,
        color: "#777777",
        marginBottom: 6,
        textTransform: "uppercase",
        fontWeight: 800,
    },

    help: {
        marginTop: 6,
        fontSize: 12,
        color: "#8a8a8a",
        lineHeight: 1.35,
    },

    row: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1.2fr",
        gap: 8,
        minWidth: 0,
    },

    select: {
        width: "100%",
        boxSizing: "border-box",
        minWidth: 0,
        padding: "11px 12px",
        borderRadius: 12,
        border: "1px solid #e0e0e0",
        background: "#f5f5f5",
        color: "#111111",
        outline: "none",
        fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
} as const;
