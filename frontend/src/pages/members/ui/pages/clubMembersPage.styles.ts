// frontend/src/pages/members/ui/pages/clubMembersPage.styles.ts
import type { CSSProperties } from "react";

const TG_BG = "#17212b";
const TG_SECONDARY = "#232e3c";
const TG_TEXT = "#f5f5f5";
const TG_HINT = "#708499";
const TG_ACCENT = "#6ab3f3";
const TG_BORDER = "rgba(255,255,255,0.08)";

export const clubMembersPageStyles: Record<string, any> = {
    root: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        background: TG_BG,
        color: TG_TEXT,
    } satisfies CSSProperties,

    tabsWrap: {
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        gap: 8,
        padding: "10px 12px 8px",
        background: TG_BG,
    } satisfies CSSProperties,

    tab: (active: boolean): CSSProperties => ({
        flex: 1,
        minWidth: 0,
        height: 36,
        padding: "0 8px",
        borderRadius: 10,
        border: active
            ? `1px solid ${TG_ACCENT}`
            : `1px solid ${TG_BORDER}`,
        background: active
            ? "rgba(106,179,243,0.14)"
            : TG_SECONDARY,
        color: active ? TG_ACCENT : TG_TEXT,

        // уменьшили размер шрифта, чтобы длинные подписи вкладок помещались
        fontSize: 11,
        fontWeight: 600,

        cursor: "pointer",

        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    }),

    tabContent: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        minWidth: 0,
        maxWidth: "100%",
    } satisfies CSSProperties,

    tabText: {
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    } satisfies CSSProperties,

    tabBadge: (active: boolean): CSSProperties => ({
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#ff4d6d",
        flexShrink: 0,
        boxShadow: active
            ? "0 0 0 2px rgba(106,179,243,0.18)"
            : "0 0 0 2px rgba(35,46,60,0.9)",
    }),

    titleRow: {
        padding: "0 16px 8px",
        fontSize: 15,
        fontWeight: 700,
        color: TG_HINT,
    } satisfies CSSProperties,

    content: {
        display: "flex",
        flexDirection: "column",
        gap: 0,
        paddingBottom: 20,
    } satisfies CSSProperties,

    list: {
        display: "flex",
        flexDirection: "column",
        gap: 0,
    } satisfies CSSProperties,

    placeholder: {
        padding: "20px 16px",
        color: TG_HINT,
        fontSize: 14,
    } satisfies CSSProperties,

    historyCard: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "14px 16px",
        borderBottom: `1px solid ${TG_BORDER}`,
        background: TG_SECONDARY,
    } satisfies CSSProperties,

    historyTop: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    } satisfies CSSProperties,

    historyTitle: {
        color: TG_TEXT,
        fontSize: 14,
        fontWeight: 700,
    } satisfies CSSProperties,

    historyMeta: {
        color: TG_HINT,
        fontSize: 12,
        lineHeight: 1.45,
    } satisfies CSSProperties,

    historyTime: {
        color: TG_TEXT,
        fontSize: 12,
        opacity: 0.8,
    } satisfies CSSProperties,

    historyDelta: (positive: boolean): CSSProperties => ({
        minWidth: 56,
        textAlign: "right",
        color: positive ? "#7de7a4" : "#ff9c9c",
        fontSize: 15,
        fontWeight: 700,
    }),
};
