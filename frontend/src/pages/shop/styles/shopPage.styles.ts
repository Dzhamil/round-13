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

    sectionDescription: {
        marginTop: -2,
        fontSize: 13,
        lineHeight: 1.4,
        color: "var(--tg-theme-hint-color, rgba(0,0,0,0.55))",
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
        flexDirection: "column" as const,
        gap: 14,
        boxSizing: "border-box" as const,
    },

    itemListContentButton: {
        width: "100%",
        padding: 0,
        display: "flex",
        gap: 14,
        alignItems: "flex-start" as const,
        border: "none",
        background: "transparent",
        textAlign: "left" as const,
        cursor: "pointer",
        boxSizing: "border-box" as const,
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

    itemListMeta: {
        fontSize: 12,
        lineHeight: 1.35,
        fontWeight: 600,
        color: "var(--tg-theme-button-color, #3390ec)",
    },

    itemListPrice: {
        marginTop: 2,
        fontWeight: 600,
        fontSize: 14,
        color: "var(--tg-theme-text-color, #111)",
    },

    itemListActions: {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: 8,
        width: "100%",
        boxSizing: "border-box" as const,
    },

    itemListActionPrimary: {
        flex: "1 1 120px",
        minHeight: 38,
        padding: "9px 12px",
        borderRadius: 12,
        border: "none",
        background: "var(--tg-theme-button-color, #3390ec)",
        color: "var(--tg-theme-button-text-color, #ffffff)",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        boxSizing: "border-box" as const,
    },

    itemListActionSecondary: {
        flex: "1 1 120px",
        minHeight: 38,
        padding: "9px 12px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "transparent",
        color: "var(--tg-theme-text-color, #111)",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        boxSizing: "border-box" as const,
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

    detailsActions: {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: 10,
        width: "100%",
        boxSizing: "border-box" as const,
    },

    detailsPrimaryButton: {
        flex: "1 1 150px",
        minHeight: 44,
        padding: "12px 14px",
        borderRadius: 14,
        border: "none",
        background: "var(--tg-theme-button-color, #3390ec)",
        color: "var(--tg-theme-button-text-color, #ffffff)",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 15,
        boxSizing: "border-box" as const,
    },

    detailsSecondaryButton: {
        flex: "1 1 150px",
        minHeight: 44,
        padding: "12px 14px",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "var(--tg-theme-secondary-bg-color, #ffffff)",
        color: "var(--tg-theme-text-color, #111)",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 15,
        boxSizing: "border-box" as const,
    },

    detailsMeta: {
        fontSize: 13,
        lineHeight: 1.4,
        fontWeight: 600,
        color: "var(--tg-theme-button-color, #3390ec)",
    },

    modalSuccessText: {
        marginTop: 14,
        fontSize: 14,
        fontWeight: 600,
        color: "#35c759",
    },

    infoCard: {
        marginTop: 14,
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(53,199,89,0.25)",
        background: "rgba(53,199,89,0.12)",
    },

    trainingRequestBox: {
        marginTop: 16,
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(51,144,236,0.22)",
        background: "rgba(51,144,236,0.08)",
    },

    trainingRequestTitle: {
        fontSize: 14,
        fontWeight: 700,
    },

    trainingRequestHint: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 1.35,
        color: "var(--tg-theme-hint-color, rgba(0,0,0,0.55))",
    },

    trainingRequestFields: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))",
        gap: 10,
        marginTop: 12,
    },

    trainingRequestField: {
        display: "flex",
        flexDirection: "column" as const,
        minWidth: 0,
    },

    trainingRequestSummary: {
        marginTop: 8,
        padding: "8px 10px",
        borderRadius: 10,
        background: "rgba(51,144,236,0.10)",
        color: "var(--tg-theme-text-color, #111)",
        fontSize: 13,
        lineHeight: 1.35,
        fontWeight: 600,
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
