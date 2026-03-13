// frontend/src/pages/shop/ui/components/CategoryCard/CategoryCard.styles.ts
export const shopCategoryCardStyles = {
    categoryCardContainer: {
        borderRadius: 16,
        background: "var(--tg-theme-secondary-bg-color, #1c1c1e)",
        padding: 14,
        display: "flex",
        flexDirection: "column" as const,
        gap: 12,
    },

    categoryCardContent: {
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        background: "transparent",
        border: "none",
        padding: 0,
        textAlign: "left" as const,
        cursor: "pointer",
        width: "100%",
    },

    categoryCardImage: {
        width: 72,
        height: 72,
        borderRadius: 12,
        objectFit: "cover" as const,
        background: "var(--tg-theme-bg-color, #2c2c2e)",
        flexShrink: 0,
    },

    categoryCardTitle: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 4,
        color: "var(--tg-theme-text-color, #ffffff)",
    },

    categoryCardDescription: {
        fontSize: 14,
        margin: 0,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.7))",
    },

    categoryCardCount: {
        fontSize: 13,
        marginTop: 6,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.6))",
    },

    categoryCardActions: {
        display: "flex",
        gap: 8,
    },

    categoryCardActionBtn: {
        flex: 1,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "var(--tg-theme-bg-color, #2c2c2e)",
        color: "var(--tg-theme-text-color, #ffffff)",
        fontWeight: 600,
        cursor: "pointer",
    },

    categoryCardDeleteBtn: {
        border: "1px solid rgba(255,59,48,0.35)",
        background: "rgba(255,59,48,0.12)",
        color: "var(--tg-theme-destructive-text-color, #ff3b30)",
    },
};