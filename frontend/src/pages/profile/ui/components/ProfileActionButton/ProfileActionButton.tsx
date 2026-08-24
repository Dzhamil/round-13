import type { CSSProperties, ReactNode } from "react";

type ProfileActionButtonProps = {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "regular" | "compact";
    fullWidth?: boolean;
    type?: "button" | "submit";
};

const baseStyle: CSSProperties = {
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40px",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid transparent",
    fontSize: "12px",
    fontWeight: 700,
    fontFamily: "inherit",
    lineHeight: 1,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    textAlign: "center",
    whiteSpace: "normal",
    cursor: "pointer",
    transition: "opacity 120ms ease",
};

const sizes: Record<NonNullable<ProfileActionButtonProps["size"]>, CSSProperties> = {
    regular: {
        minHeight: "40px",
        padding: "10px 14px",
        fontSize: "12px",
    },
    compact: {
        minHeight: "32px",
        padding: "7px 11px",
        fontSize: "11px",
    },
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
    danger: {
        background: "rgba(239,68,68,0.14)",
        borderColor: "rgba(239,68,68,0.38)",
        color: "#fecaca",
        boxShadow: "0 12px 28px rgba(127,29,29,0.18)",
    },
};

export function ProfileActionButton({
    children,
    onClick,
    disabled = false,
    variant = "primary",
    size = "regular",
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
                ...sizes[size],
                ...variants[variant],
                width: fullWidth ? "100%" : "auto",
                minWidth: 0,
                opacity: disabled ? 0.52 : 1,
                cursor: disabled ? "default" : "pointer",
            }}
        >
            {children}
        </button>
    );
}
