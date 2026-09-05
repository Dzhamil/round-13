export const shopPageViewStyles = {
    page: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 16,
        padding: 16,
        background: "rgba(15, 23, 35, 0.7)",
        color: "var(--tg-theme-text-color, #111)",
    },

    tabsWrap: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 10,
    },

    tab: (active: boolean) => ({
        width: "100%",
        minHeight: 56,
        padding: "14px 16px",
        borderRadius: 14,
        border: active
            ? "1px solid rgba(51,144,236,0.35)"
            : "1px solid rgba(0,0,0,0.08)",
        background: active
            ? "rgba(51,144,236,0.12)"
            : "var(--tg-theme-secondary-bg-color, #ffffff)",
        color: active
            ? "var(--tg-theme-button-color, #3390ec)"
            : "var(--tg-theme-text-color, #111)",
        fontWeight: 800,
        fontSize: 18,
        cursor: "pointer",
        textAlign: "center" as const,
        boxSizing: "border-box" as const,
        whiteSpace: "normal" as const,
        overflow: "hidden" as const,
    }),

    tabInner: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        minWidth: 0,
        maxWidth: "100%",
    },

    tabBadge: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#ff4d6d",
        flexShrink: 0,
    },

    adminAddCategoryBtn: {
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

    categoriesWrap: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 12,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: "var(--tg-theme-text-color, #111)",
    },

    trainingHeader: {
        display: "flex",
        gap: 8,
        overflowX: "auto" as const,
        WebkitOverflowScrolling: "touch" as const,
        paddingBottom: 2,
        scrollbarWidth: "none" as const,
    },

    trainingTypeButton: (active: boolean) => ({
        flex: "1 0 145px",
        minHeight: 44,
        maxWidth: "100%",
        padding: "11px 14px",
        borderRadius: 14,
        border: active
            ? "1px solid rgba(51,144,236,0.35)"
            : "1px solid rgba(0,0,0,0.08)",
        background: active
            ? "rgba(51,144,236,0.12)"
            : "var(--tg-theme-secondary-bg-color, #ffffff)",
        color: active
            ? "var(--tg-theme-button-color, #3390ec)"
            : "var(--tg-theme-text-color, #111)",
        fontWeight: 800,
        fontSize: 15,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
    }),

    trainingProductsGrid: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: 10,
        width: "100%",
        boxSizing: "border-box" as const,
    },

    trainingAdminActions: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 8,
        width: "100%",
        boxSizing: "border-box" as const,
    },

    trainingEmpty: {
        padding: 12,
        borderRadius: 12,
        background: "rgba(0,0,0,0.04)",
        color: "var(--tg-theme-hint-color, rgba(0,0,0,0.62))",
        fontSize: 14,
        lineHeight: 1.4,
        overflowWrap: "anywhere" as const,
    },

    requestSubTabs: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 8,
        padding: 4,
        borderRadius: 14,
        background: "rgba(0,0,0,0.04)",
        boxSizing: "border-box" as const,
    },

    requestSubTab: (active: boolean) => ({
        minHeight: 42,
        padding: "10px 12px",
        borderRadius: 10,
        border: active ? "1px solid rgba(51,144,236,0.35)" : "1px solid transparent",
        background: active
            ? "var(--tg-theme-secondary-bg-color, #ffffff)"
            : "transparent",
        color: active
            ? "var(--tg-theme-button-color, #3390ec)"
            : "var(--tg-theme-text-color, #111)",
        fontWeight: 800,
        fontSize: 14,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
        overflow: "hidden" as const,
        textOverflow: "ellipsis" as const,
    }),

    subtitle: {
        fontSize: 14,
        opacity: 0.6,
    },

    backButton: {
        padding: "10px 14px",
        borderRadius: 12,
        border: "none",
        background: "var(--tg-theme-button-color, #0088cc)",
        color: "var(--tg-theme-button-text-color, #ffffff)",
        fontWeight: 600,
        fontSize: 14,
        alignSelf: "flex-start" as const,
    },
};
