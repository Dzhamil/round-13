// frontend/src/pages/shop/styles/shopModal.styles.ts
export const shopModalStyles = {
    /* ================= OVERLAY ================= */

    modalOverlay: {
        position: "fixed" as const,
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 12,
        overflow: "auto" as const,
        WebkitOverflowScrolling: "touch" as const,
    },

    /* ================= CARD ================= */

    modalCard: {
        width: 420,
        maxWidth: "100%",
        background: "var(--tg-theme-secondary-bg-color, #1c1c1e)",
        borderRadius: 18,
        padding: 18,
        color: "var(--tg-theme-text-color, #ffffff)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        maxHeight: "85vh",
        overflow: "auto" as const,
        boxSizing: "border-box" as const,
    },

    modalHeaderRow: {
        display: "flex",
        justifyContent: "space-between" as const,
        alignItems: "center" as const,
        marginBottom: 18,
    },

    modalCloseBtn: {
        border: "none",
        background: "transparent",
        fontSize: 22,
        cursor: "pointer",
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.6))",
    },

    modalTitle: {
        fontWeight: 700,
        fontSize: 18,
    },

    modalLabel: {
        display: "block",
        fontSize: 13,
        marginBottom: 6,
        color: "var(--tg-theme-hint-color, rgba(255,255,255,0.6))",
        fontWeight: 600,
    },

    modalInput: {
        display: "block",
        width: "100%",
        boxSizing: "border-box" as const,
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.06)",
        background: "var(--tg-theme-bg-color, #2c2c2e)",
        color: "var(--tg-theme-text-color, #ffffff)",
        marginBottom: 18,
    },

    modalTextarea: {
        display: "block",
        width: "100%",
        boxSizing: "border-box" as const,
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)",
        background: "var(--tg-theme-bg-color, #2c2c2e)",
        color: "var(--tg-theme-text-color, #ffffff)",
        resize: "vertical" as const,
        minHeight: 120,
    },

    modalButtonsRow: {
        display: "flex",
        gap: 12,
        marginTop: 22,
    },

    modalBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "transparent",
        color: "var(--tg-theme-text-color, #ffffff)",
        fontWeight: 600,
        cursor: "pointer",
    },

    modalBtnPrimary: {
        background: "var(--tg-theme-button-color, #3390ec)",
        color: "var(--tg-theme-button-text-color, #ffffff)",
        border: "none",
    },

    modalErrorText: {
        fontSize: 13,
        marginBottom: 10,
        color: "var(--tg-theme-destructive-text-color, #ff3b30)",
    },

    /* ================= DESCRIPTION BLOCK ================= */

    modalDescriptionRow: {
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        marginBottom: 18,
    },

    modalDescriptionImageWrap: {
        width: "25%",
        maxWidth: 100,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
    },

    modalDescriptionImage: {
        width: "100%",
        aspectRatio: "1 / 1",
        objectFit: "cover" as const,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "var(--tg-theme-bg-color, #2c2c2e)",
    },

    modalDescriptionImagePlaceholder: {
        width: "100%",
        aspectRatio: "1 / 1",
        borderRadius: 14,
        border: "1px dashed rgba(255,255,255,0.2)",
        background: "var(--tg-theme-bg-color, #2c2c2e)",
    },

    modalDescriptionTextarea: {
        display: "block",
        flex: 1,
        boxSizing: "border-box" as const,
        minHeight: 130,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)",
        background: "var(--tg-theme-bg-color, #2c2c2e)",
        color: "var(--tg-theme-text-color, #ffffff)",
        padding: 14,
        resize: "vertical" as const,
    },

    /* ================= IMAGE ACTION ICON BUTTONS ================= */

    modalImageActions: {
        display: "flex",
        gap: 8,
        marginTop: 8,
    },

    modalIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        border: "none",
        background: "rgba(255,255,255,0.06)",
        color: "var(--tg-theme-text-color, #ffffff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 18,
    },

    /* ================= IMAGE CROP MODAL ================= */

    modalCropCard: {
        width: 420,
        maxWidth: "100%",
        background: "var(--tg-theme-secondary-bg-color, #1c1c1e)",
        borderRadius: 18,
        padding: 16,
        color: "var(--tg-theme-text-color, #ffffff)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        boxSizing: "border-box" as const,
        maxHeight: "86vh",
        display: "flex",
        flexDirection: "column" as const,
        overflow: "hidden" as const,
    },

    modalCropScroll: {
        overflow: "auto" as const,
        WebkitOverflowScrolling: "touch" as const,
        paddingBottom: 12,
    },

    modalCropFooter: {
        marginTop: "auto",
        paddingTop: 12,
        borderTop: "1px solid rgba(255,255,255,0.06)",
    },

    modalCropArea: {
        width: "100%",
        aspectRatio: "1 / 1",
        borderRadius: 16,
        overflow: "hidden" as const,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        touchAction: "none" as const,
        position: "relative" as const,
        marginBottom: 14,
    },

    modalCropAreaGrab: {
        cursor: "grab",
    },

    modalCropAreaGrabbing: {
        cursor: "grabbing",
    },

    modalCropImage: {
        position: "absolute" as const,
        left: "50%",
        top: "50%",
        transform: "var(--crop-transform)" as any,
        width: "var(--crop-width)" as any,
        height: "var(--crop-height)" as any,
        userSelect: "none" as const,
        WebkitUserSelect: "none" as const,
        pointerEvents: "none" as const,
        maxWidth: "none",
        maxHeight: "none",
        willChange: "transform",
    },
};