import type { CSSProperties, ReactNode } from "react";

type ProfileActionButtonProps = {
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
    minHeight: "46px",
    padding: "12px 16px",
    borderRadius: "14px",
    border: "1px solid transparent",
    fontSize: "13px",
    fontWeight: 700,
    fontFamily: "inherit",
    lineHeight: 1,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "opacity 120ms ease",
};

const variants: Record<NonNullable<ProfileActionButtonProps["variant"]>, CSSProperties> = {
    primary: {
        background: "var(--tg-theme-button-color, #2ea6ff)",
        borderColor: "rgba(46,166,255,0.24)",
        color: "var(--tg-theme-button-text-color, #ffffff)",
        boxShadow: "0 12px 28px rgba(46,166,255,0.22)",
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

export function ProfileActionButton({
    children,
    onClick,
    disabled = false,
    variant = "primary",
    fullWidth = false,
    type = "button",
}: ProfileActionButtonProps) {
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
