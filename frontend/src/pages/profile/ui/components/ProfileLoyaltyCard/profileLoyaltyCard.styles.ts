import type { CSSProperties } from "react";

export const profileLoyaltyCardStyles = {
    root: {
        display: "grid",
        gap: 12,
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(106,179,243,0.18)",
        background: "linear-gradient(180deg, rgba(29,40,52,0.98) 0%, rgba(21,31,41,0.98) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
        overflow: "hidden",
    } satisfies CSSProperties,

    header: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        minWidth: 0,
    } satisfies CSSProperties,

    eyebrow: {
        fontSize: 11,
        fontWeight: 800,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.56))",
        textTransform: "uppercase",
    } satisfies CSSProperties,

    title: {
        marginTop: 4,
        color: "var(--tg-theme-text-color, #f5f5f5)",
        fontSize: 24,
        fontWeight: 800,
        lineHeight: 1.1,
    } satisfies CSSProperties,

    rankPill: {
        flex: "0 1 auto",
        maxWidth: "48%",
        padding: "7px 10px",
        borderRadius: 999,
        border: "1px solid rgba(106,179,243,0.22)",
        background: "rgba(106,179,243,0.12)",
        color: "#9fd0ff",
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1.2,
        textAlign: "right",
        overflowWrap: "anywhere",
    } satisfies CSSProperties,

    progressWrap: {
        display: "grid",
        gap: 7,
    } satisfies CSSProperties,

    progressHeader: {
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.68))",
        fontSize: 12,
        lineHeight: 1.35,
    } satisfies CSSProperties,

    progressTrack: {
        height: 8,
        borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    } satisfies CSSProperties,

    progressFill: (progress: number): CSSProperties => ({
        width: `${progress}%`,
        height: "100%",
        borderRadius: 999,
        background: "#6ab3f3",
    }),

    note: {
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.68))",
        fontSize: 12,
        lineHeight: 1.45,
    } satisfies CSSProperties,

    history: {
        display: "grid",
        gap: 8,
    } satisfies CSSProperties,

    historyTitle: {
        color: "var(--tg-theme-text-color, #f5f5f5)",
        fontSize: 13,
        fontWeight: 800,
    } satisfies CSSProperties,

    historyItem: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        padding: "9px 0",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        minWidth: 0,
    } satisfies CSSProperties,

    historyText: {
        minWidth: 0,
    } satisfies CSSProperties,

    historyReason: {
        color: "var(--tg-theme-text-color, #f5f5f5)",
        fontSize: 13,
        fontWeight: 700,
        lineHeight: 1.35,
        overflowWrap: "anywhere",
    } satisfies CSSProperties,

    historyMeta: {
        marginTop: 3,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.6))",
        fontSize: 11,
        lineHeight: 1.35,
    } satisfies CSSProperties,

    delta: (positive: boolean): CSSProperties => ({
        flex: "0 0 auto",
        color: positive ? "#63d28f" : "#ffb0b0",
        fontSize: 14,
        fontWeight: 800,
    }),

    empty: {
        padding: "9px 0",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
        fontSize: 12,
        lineHeight: 1.45,
    } satisfies CSSProperties,

    stateRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        color: "#ffb0b0",
        fontSize: 12,
        lineHeight: 1.45,
    } satisfies CSSProperties,

    retryButton: {
        appearance: "none",
        flex: "0 0 auto",
        height: 34,
        padding: "0 12px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.06)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
        font: "inherit",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
    } satisfies CSSProperties,
};
