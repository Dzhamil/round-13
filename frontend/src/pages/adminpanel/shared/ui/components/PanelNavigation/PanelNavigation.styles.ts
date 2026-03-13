export const panelNavigationStyles = {
    nav: {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: 10,
    },
    link: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 40,
        padding: "0 14px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.04)",
        color: "inherit",
        textDecoration: "none",
        fontSize: 13,
        fontWeight: 700,
    },
    linkActive: {
        border: "1px solid rgba(78, 161, 255, 0.36)",
        background: "rgba(78, 161, 255, 0.12)",
        color: "#9bd1ff",
    },
} as const;
