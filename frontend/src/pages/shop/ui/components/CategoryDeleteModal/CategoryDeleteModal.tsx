// frontend/src/pages/shop/ui/components/CategoryDeleteModal/CategoryDeleteModal.tsx
import { useState } from "react";
import { shopModalStyles as s } from "../../../styles/shopModal.styles";
import { ModalShell } from "../ModalShell/ModalShell";

type Props = {
    open: boolean;
    categoryId: string | null;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
};

export function CategoryDeleteModal({ open, categoryId, onCancel, onConfirm }: Props) {
    const [submitting, setSubmitting] = useState(false);

    if (!open || !categoryId) return null;

    const cancel = () => {
        if (submitting) return;
        onCancel();
    };

    const confirm = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await onConfirm();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalShell onClose={cancel}>
            <div style={s.modalCard} onMouseDown={(e) => e.stopPropagation()}>
                <div style={s.modalHeaderRow}>
                    <div style={s.modalTitle}>Удаление категории</div>
                    <button
                        type="button"
                        onClick={cancel}
                        aria-label="Закрыть"
                        style={s.modalCloseBtn}
                        disabled={submitting}
                    >
                        ✕
                    </button>
                </div>

                <div style={s.modalText}>
                    Категория и ее товары будут скрыты из магазина. История заказов останется доступной.
                </div>

                <div style={s.modalButtonsRow}>
                    <button type="button" onClick={cancel} style={s.modalBtn} disabled={submitting}>
                        Отмена
                    </button>

                    <button
                        type="button"
                        onClick={() => void confirm()}
                        style={{ ...s.modalBtn, ...s.modalBtnDanger }}
                        disabled={submitting}
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}
