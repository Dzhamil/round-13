// frontend/src/pages/shop/styles/shopPage.styles.ts
export const shopPageStyles = {
    page: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 14,
        padding: "8px 12px",
        background: "var(--tg-theme-bg-color, #f4f4f5)",
        color: "var(--tg-theme-text-color, #111)",
    },

    title: {
        fontSize: 20,
        fontWeight: 700,
    },

    subtitle: {
        fontSize: 14,
        color: "var(--tg-theme-hint-color, rgba(0,0,0,0.55))",
    },

    actionError: {
        marginBottom: 12,
        color: "var(--tg-theme-destructive-text-color, #ff3b30)",
        fontSize: 14,
        fontWeight: 600,
    },

    sectionsWrap: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 18,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 6,
    },

    grid: {
        display: "grid",
        gap: 10,
    },

    card: {
        padding: 12,
        borderRadius: 16,
        background: "var(--tg-theme-secondary-bg-color, #ffffff)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column" as const,
        gap: 8,
    },

    cardImage: {
        width: "100%",
        height: 140,
        borderRadius: 12,
        objectFit: "cover" as const,
        background: "rgba(0,0,0,0.05)",
    },

    cardTitle: {
        fontSize: 15,
        fontWeight: 600,
        color: "var(--tg-theme-text-color, #111)",
    },

    cardPrice: {
        fontWeight: 600,
        fontSize: 15,
        color: "var(--tg-theme-text-color, #111)",
    },

    itemListCard: {
        width: "100%",
        borderRadius: 16,
        background: "var(--tg-theme-secondary-bg-color, #ffffff)",
        padding: 14,
        display: "flex",
        gap: 14,
        alignItems: "flex-start" as const,
        border: "none",
        textAlign: "left" as const,
        cursor: "pointer",
    },

    itemListImage: {
        width: 72,
        height: 72,
        borderRadius: 12,
        objectFit: "cover" as const,
        background: "rgba(0,0,0,0.05)",
        flexShrink: 0,
    },

    itemListBody: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 6,
        minWidth: 0,
        flex: 1,
    },

    itemListDescription: {
        margin: 0,
        fontSize: 14,
        lineHeight: 1.35,
        color: "var(--tg-theme-hint-color, rgba(0,0,0,0.55))",
    },

    itemListPrice: {
        marginTop: 2,
        fontWeight: 600,
        fontSize: 14,
        color: "var(--tg-theme-text-color, #111)",
    },

    backButton: {
        padding: "8px 12px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "var(--tg-theme-secondary-bg-color, #ffffff)",
        color: "var(--tg-theme-text-color, #111)",
        cursor: "pointer",
        fontWeight: 600,
    },

    historyItem: {
        padding: 12,
        borderRadius: 12,
        background: "var(--tg-theme-secondary-bg-color, #ffffff)",
    },

    historyRow: {
        display: "flex",
        justifyContent: "space-between" as const,
        alignItems: "center" as const,
    },

    historyDate: {
        fontSize: 12,
        color: "var(--tg-theme-hint-color, rgba(0,0,0,0.55))",
        marginTop: 6,
    },

    historyEmpty: {
        fontSize: 14,
        color: "var(--tg-theme-hint-color, rgba(0,0,0,0.55))",
    },

    detailsWrap: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 12,
    },

    detailsImage: {
        width: 160,
        maxWidth: "100%",
        height: 160,
        alignSelf: "flex-start" as const,
        borderRadius: 18,
        objectFit: "cover" as const,
    },

    detailsPrice: {
        fontSize: 18,
        fontWeight: 700,
        color: "var(--tg-theme-text-color, #111)",
    },

    modalSuccessText: {
        marginTop: 14,
        fontSize: 14,
        fontWeight: 600,
        color: "#35c759",
    },

    itemsGrid: {
        display: "grid",
        gap: 10,
    },

    adminAddCategoryBtn: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "var(--tg-theme-secondary-bg-color, #ffffff)",
        color: "var(--tg-theme-text-color, #111)",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 15,
        textAlign: "center" as const,
    },

    categoriesWrap: {
        marginTop: 8,
    },
};
