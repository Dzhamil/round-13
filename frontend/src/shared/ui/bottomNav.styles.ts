// frontend/src/shared/ui/bottomNav.styles.ts
import type { CSSProperties } from "react";
import { hudTheme } from "./styles/hudTheme";

const { gradients, effects, colors } = hudTheme;

export const bottomNavStyles = {
    fixedWrap: {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        pointerEvents: "none", // чтобы клики принимал только сам nav
    } satisfies CSSProperties,

    fixedInner: {
        maxWidth: 720,
        margin: "0 auto",
        pointerEvents: "auto",
    } satisfies CSSProperties,

    nav: {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        background: gradients.metal,
        borderTop: "1px solid rgba(124,255,107,0.18)",
        boxShadow: `${effects.inset}, ${effects.outline}, ${effects.shadowBottom}`,
        paddingBottom: "env(safe-area-inset-bottom)",
    } satisfies CSSProperties,

    item: (active: boolean) =>
        ({
            padding: "12px 6px",
            textAlign: "center",
            textDecoration: "none",
            fontSize: 11,
            letterSpacing: 0.2,
            color: active ? colors.hudGreen : "rgba(255,255,255,0.70)",
            fontWeight: active ? 900 : 700,
            textShadow: active
                ? "0 0 14px rgba(124,255,107,0.22), 0 1px 0 rgba(0,0,0,0.75)"
                : "none",
            userSelect: "none",
        } satisfies CSSProperties),
};
