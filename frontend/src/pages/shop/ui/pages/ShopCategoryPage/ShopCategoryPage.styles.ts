export const shopCategoryPageStyles = {
    page: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 16,
        padding: 16,
        background: "var(--tg-theme-bg-color, #f4f4f5)",
        color: "var(--tg-theme-text-color, #111)",
    },

    adminAddItemBtn: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "var(--tg-theme-secondary-bg-color, #ffffff)",
        color: "var(--tg-theme-text-color, #111)",
        fontWeight: 600,
        fontSize: 15,
        cursor: "pointer",
    },

    subtitle: {
        fontSize: 14,
        opacity: 0.6,
    },

    retryBtn: {
        padding: "10px 14px",
        borderRadius: 12,
        border: "none",
        background: "var(--tg-theme-button-color, #0088cc)",
        color: "var(--tg-theme-button-text-color, #ffffff)",
        fontWeight: 600,
        fontSize: 14,
        alignSelf: "flex-start" as const,
    },

    itemsGrid: {
        display: "grid",
        gap: 12,
    },
};