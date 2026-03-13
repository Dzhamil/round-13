export const shopPageViewStyles = {
    page: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 16,
        padding: 16,
        background: "var(--tg-theme-bg-color, #f4f4f5)",
        color: "var(--tg-theme-text-color, #111)",
    },

    tabsWrap: {
        display: "flex",
        gap: 8,
    },

    tab: (active: boolean) => ({
        flex: 1,
        minWidth: 0,
        padding: "10px 8px",
        borderRadius: 12,
        border: active
            ? "1px solid rgba(51,144,236,0.35)"
            : "1px solid rgba(0,0,0,0.08)",
        background: active
            ? "rgba(51,144,236,0.12)"
            : "var(--tg-theme-secondary-bg-color, #ffffff)",
        color: active
            ? "var(--tg-theme-button-color, #3390ec)"
            : "var(--tg-theme-text-color, #111)",
        fontWeight: 700,
        fontSize: 11,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
        overflow: "hidden" as const,
        textOverflow: "ellipsis" as const,
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
