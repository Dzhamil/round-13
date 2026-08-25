// frontend/src/pages/profile/ui/components/ProfileHeader/profileHeader.styles.ts

export const profileHeaderStyles = {
    root: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        minWidth: 0,
        width: "100%",
    } as const,

    avatar: (avatarUrl?: string) =>
        ({
            width: 72,
            height: 72,
            borderRadius: 13,
            backgroundColor: "rgba(255,255,255,0.08)",
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
        }) as const,

    content: {
        flex: "1 1 auto",
        minWidth: 0,
        display: "grid",
        gap: 6,
    } as const,

    titleRow: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: 8,
        alignItems: "start",
        minWidth: 0,
    } as const,

    name: {
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: 0,
        lineHeight: 1.15,
        color: "var(--tg-theme-text-color, #f5f5f5)",
        overflowWrap: "anywhere",
    } as const,

    infoList: {
        display: "grid",
        gap: 3,
        minWidth: 0,
    } as const,

    infoRow: {
        display: "grid",
        gridTemplateColumns: "minmax(82px, max-content) minmax(0, 1fr)",
        gap: 6,
        alignItems: "baseline",
        minWidth: 0,
        fontSize: 13,
        lineHeight: 1.25,
        color: "var(--tg-theme-text-color, #f5f5f5)",
    } as const,

    infoLabel: {
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.58))",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 0,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
    } as const,

    infoValue: {
        minWidth: 0,
        fontSize: 13,
        fontWeight: 700,
        lineHeight: 1.25,
        color: "var(--tg-theme-text-color, #f5f5f5)",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
    } as const,

    action: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        flexShrink: 0,
    } as const,
};
