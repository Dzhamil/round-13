export const myEntitlementActivityBlockStyles = {
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

    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    } as const,

    itemTitle: {
        fontSize: 14,
        fontWeight: 600,
    } as const,

    badgeBase: {
        flexShrink: 0,
        padding: "4px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
    } as const,

    badgePositive: {
        background: "rgba(72, 199, 116, 0.18)",
        color: "#a6f3c3",
    } as const,

    badgeNegative: {
        background: "rgba(255, 107, 107, 0.18)",
        color: "#ffc2c2",
    } as const,

    subtitle: {
        marginTop: 4,
        fontSize: 13,
        opacity: 0.74,
    } as const,

    meta: {
        marginTop: 8,
        display: "grid",
        gap: 4,
        fontSize: 12,
        opacity: 0.66,
    } as const,
};
