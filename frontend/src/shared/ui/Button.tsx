// frontend/src/shared/ui/Button.tsx
import React from "react";

type Props = {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "primary" | "secondary";
    type?: "button" | "submit";
};

export function Button({
                           children,
                           onClick,
                           disabled = false,
                           variant = "primary",
                           type = "button",
                       }: Props) {
    const baseStyle: React.CSSProperties = {
        width: "100%",
        padding: "12px 12px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 900,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    };

    // В светлой теме основные кнопки синего цвета, вторичные — серые.
    const primary: React.CSSProperties = {
        background: "#0088cc",
        border: "1px solid #0088cc",
        color: "#ffffff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        textShadow: "none",
    };

    const secondary: React.CSSProperties = {
        background: "#e0e0e0",
        border: "1px solid #b0b0b0",
        color: "#000000",
        boxShadow: "none",
    };

    const variantStyle = variant === "secondary" ? secondary : primary;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{ ...baseStyle, ...variantStyle }}
        >
            {children}
        </button>
    );
}

export default Button;
