// frontend/src/pages/profile/ui/components/ProfileHeader/profileHeader.styles.ts

export const profileHeaderStyles = {
    root: {
        display: "flex",
        gap: 16,
        alignItems: "center",
    } as const,

    avatar: (avatarUrl?: string) =>
        ({
            width: 84,
            height: 84,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.08)",
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 18px 36px rgba(0,0,0,0.24)",
        }) as const,

    name: {
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: "var(--tg-theme-text-color, #f5f5f5)",
    } as const,

    muted: {
        marginTop: 4,
        fontSize: 14,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.64))",
    } as const,

    row: {
        marginTop: 6,
        fontSize: 14,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    } as const,

    strong: {
        fontWeight: 800,
        color: "var(--tg-theme-button-color, #62b0ff)",
    } as const,

    badge: {
        display: "inline-block",
        marginLeft: 8,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        color: "var(--tg-theme-button-color, #62b0ff)",
        background: "rgba(46,166,255,0.14)",
        border: "1px solid rgba(46,166,255,0.28)",
    } as const,
};
