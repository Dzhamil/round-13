// frontend/src/pages/shop/ui/components/ModalShell/ModalShell.tsx
import { useEffect } from "react";
import { shopModalStyles as s } from "../../../styles/shopModal.styles";

type Props = {
    children: React.ReactNode;
    onClose: () => void;
    closeOnBackdrop?: boolean;
};

export function ModalShell({ children, onClose, closeOnBackdrop = true }: Props) {
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    return (
        <div
            data-swipe-back-exclude
            style={s.modalOverlay}
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
                if (!closeOnBackdrop) return;
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {children}
        </div>
    );
}
