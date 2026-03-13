import type { CSSProperties } from "react";

export const scheduleClubEventsStyles = {
    text: {
        margin: 0,
        fontSize: "14px",
        lineHeight: 1.5,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.7))",
    },
} satisfies Record<string, CSSProperties>;
