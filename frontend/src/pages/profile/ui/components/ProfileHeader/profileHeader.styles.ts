// frontend/src/pages/profile/ui/components/ProfileHeader/profileHeader.styles.ts

export const profileHeaderStyles = {
    root: {
        display: "flex",
        gap: 14,
        alignItems: "center",
    } as const,

    avatar: (avatarUrl?: string) =>
        ({
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "#eaeaea",
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            flexShrink: 0,
            border: "1px solid #e6e6e6",
            boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
        }) as const,

    name: {
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: 0.2,
        color: "#111111",
    } as const,

    muted: {
        marginTop: 4,
        fontSize: 14,
        color: "#8a8a8a",
    } as const,

    row: {
        marginTop: 6,
        fontSize: 14,
        color: "#111111",
    } as const,

    strong: {
        fontWeight: 800,
        color: "#111111",
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
        color: "#0088cc",
        background: "rgba(0,136,204,0.10)",
        border: "1px solid rgba(0,136,204,0.22)",
    } as const,
};
