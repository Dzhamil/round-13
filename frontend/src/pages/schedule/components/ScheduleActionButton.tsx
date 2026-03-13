import type { CSSProperties, ReactNode } from "react";

type ScheduleActionButtonProps = {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "ghost";
    fullWidth?: boolean;
    type?: "button" | "submit";
};

const baseStyle: CSSProperties = {
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid transparent",
    fontSize: "13px",
    fontWeight: 700,
    fontFamily: "inherit",
    lineHeight: 1,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "transform 120ms ease, opacity 120ms ease",
};

const variants: Record<NonNullable<ScheduleActionButtonProps["variant"]>, CSSProperties> = {
    primary: {
        background: "var(--tg-theme-button-color, #2ea6ff)",
        borderColor: "rgba(46,166,255,0.22)",
        color: "var(--tg-theme-button-text-color, #ffffff)",
        boxShadow: "0 12px 24px rgba(46,166,255,0.22)",
    },
    secondary: {
        background: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.08)",
        color: "var(--tg-theme-text-color, #f5f5f5)",
    },
    ghost: {
        background: "transparent",
        borderColor: "rgba(255,255,255,0.08)",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.72))",
    },
};

export function ScheduleActionButton({
    children,
    onClick,
    disabled = false,
    variant = "primary",
    fullWidth = false,
    type = "button",
}: ScheduleActionButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                ...baseStyle,
                ...variants[variant],
                width: fullWidth ? "100%" : "auto",
                opacity: disabled ? 0.52 : 1,
                cursor: disabled ? "default" : "pointer",
            }}
        >
            {children}
        </button>
    );
}
