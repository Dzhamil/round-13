export const myEntitlementsBlockStyles = {
    root: {
        marginTop: 16,
    } as const,

    title: {
        fontSize: 16,
        fontWeight: 700,
    } as const,

    empty: {
        marginTop: 10,
        opacity: 0.7,
        fontSize: 14,
    } as const,

    list: {
        marginTop: 12,
        display: "grid",
        gap: 10,
    } as const,

    item: {
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.04)",
    } as const,

    itemTitle: {
        fontSize: 14,
        fontWeight: 600,
    } as const,

    itemSubtitle: {
        marginTop: 4,
        fontSize: 13,
        opacity: 0.7,
    } as const,
};
