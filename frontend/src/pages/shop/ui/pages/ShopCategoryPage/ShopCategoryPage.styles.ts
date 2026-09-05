export const shopCategoryPageStyles = {
    page: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 16,
        padding: 16,
        background: "rgba(15, 23, 35, 0.62)",
        color: "#f5f7fa",
    },

    adminAddItemBtn: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(24, 33, 43, 0.8)",
        color: "#f5f7fa",
        fontWeight: 600,
        fontSize: 15,
        cursor: "pointer",
    },

    categoryHeader: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 8,
        padding: "2px 0 4px",
    },

    categoryTitle: {
        margin: 0,
        fontSize: 24,
        lineHeight: 1.15,
        fontWeight: 700,
        color: "#f5f7fa",
    },

    categoryDescription: {
        margin: 0,
        fontSize: 14,
        lineHeight: 1.45,
        color: "rgba(245, 247, 250, 0.72)",
    },

    subtitle: {
        fontSize: 14,
        opacity: 0.6,
    },

    emptyState: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 12,
        padding: "20px 2px",
    },

    emptyTitle: {
        margin: 0,
        fontSize: 20,
        lineHeight: 1.2,
        fontWeight: 700,
        color: "#f5f7fa",
    },

    emptyText: {
        margin: 0,
        fontSize: 14,
        lineHeight: 1.45,
        color: "rgba(245, 247, 250, 0.72)",
    },

    adminHint: {
        margin: 0,
        fontSize: 13,
        lineHeight: 1.45,
        color: "rgba(245, 247, 250, 0.72)",
    },

    emptyActionButton: {
        alignSelf: "flex-start" as const,
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(24, 33, 43, 0.8)",
        color: "#f5f7fa",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 14,
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
