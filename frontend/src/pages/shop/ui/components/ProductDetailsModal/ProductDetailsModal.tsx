import { useState } from "react";
import type { ShopCatalogItemDto } from "../../../api/product.api";
import { createShopOrder } from "../../../api/order.api";
import { shopModalStyles as modal } from "../../../styles/shopModal.styles";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";
import { formatMoney } from "../../../model/money";
import { ModalShell } from "../ModalShell/ModalShell";

type Props = {
    open: boolean;
    item: ShopCatalogItemDto | null;
    isAdmin: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

function getErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === "object") {
        if ("response" in err) {
            const response = (err as { response?: { data?: { message?: unknown } } }).response;
            const message = response?.data?.message;
            if (typeof message === "string" && message.trim().length > 0) return message;
        }
        if ("message" in err) {
            const message = (err as { message?: unknown }).message;
            if (typeof message === "string" && message.trim().length > 0) return message;
        }
    }
    return fallback;
}

export function ProductDetailsModal({ open, item, isAdmin, onClose, onEdit, onDelete }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [successText, setSuccessText] = useState<string | null>(null);

    if (!open || !item) return null;

    const cardStyle = isAdmin ? modal.modalCard : modal.modalCardLight;
    const closeBtnStyle = isAdmin ? modal.modalCloseBtn : modal.modalCloseBtnLight;
    const buttonStyle = isAdmin ? modal.modalBtn : modal.modalBtnLight;
    const primaryButtonStyle = isAdmin
        ? { ...modal.modalBtn, ...modal.modalBtnPrimary }
        : { ...modal.modalBtnLight, ...modal.modalBtnPrimaryLight };
    const dangerButtonStyle = { ...buttonStyle, ...modal.modalBtnDanger };

    const buy = async () => {
        if (submitting) return;
        setSubmitting(true);
        setActionError(null);
        setSuccessText(null);
        try {
            await createShopOrder({
                items: [{ productId: item.id, quantity: 1 }],
            });
            setSuccessText("Заявка на покупку отправлена.");
        } catch (err: unknown) {
            setActionError(getErrorMessage(err, "Не удалось оформить покупку."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalShell onClose={onClose}>
            <div style={cardStyle} onMouseDown={(e) => e.stopPropagation()}>
                <div style={modal.modalHeaderRow}>
                    <div style={modal.modalTitle}>Товар</div>
                    <button type="button" onClick={onClose} style={closeBtnStyle}>
                        ✕
                    </button>
                </div>

                <div style={s.detailsWrap}>
                    {item.imageDataUrl ? (
                        <img
                            src={item.imageDataUrl}
                            alt={item.title}
                            style={{ ...s.cardImage, ...s.detailsImage }}
                        />
                    ) : (
                        <div style={{ ...s.cardImage, ...s.detailsImage }} />
                    )}

                    <h2 style={s.title}>{item.title}</h2>
                    <p style={s.subtitle}>{item.description ?? "Описание отсутствует."}</p>
                    <p style={{ ...s.cardPrice, ...s.detailsPrice }}>
                        {formatMoney({ amount: item.priceAmount, currency: item.currency })}
                    </p>
                </div>

                {actionError ? <div style={modal.modalErrorText}>{actionError}</div> : null}
                {successText ? <div style={s.modalSuccessText}>{successText}</div> : null}

                <div style={modal.modalButtonsRow}>
                    {isAdmin ? (
                        <>
                            <button type="button" onClick={onEdit} style={buttonStyle}>
                                Редактировать
                            </button>
                            <button type="button" onClick={onDelete} style={dangerButtonStyle}>
                                Удалить
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => void buy()}
                            style={primaryButtonStyle}
                            disabled={submitting}
                        >
                            {submitting ? "Отправляем..." : "Купить товар"}
                        </button>
                    )}
                </div>
            </div>
        </ModalShell>
    );
}
