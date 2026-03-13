export const statsPeriodButtonStyles = {
    button: (active: boolean) =>
        ({
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
            color: "inherit",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
        }) as const,
};
