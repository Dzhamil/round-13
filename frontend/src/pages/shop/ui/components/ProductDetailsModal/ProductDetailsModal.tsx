import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ShopCatalogItemDto } from "../../../api/product.api";
import { createShopOrder } from "../../../api/order.api";
import { DEFAULT_SHOP_ORDER_QUANTITY, SHOP_PATH, SHOP_REQUESTS_TAB } from "../../../model/shop.constants";
import { extractShopErrorMessage } from "../../../model/shopError";
import { formatMoney } from "../../../model/money";
import { getProductCategoryContext } from "../../../model/trainingProductSemantics";
import { shopModalStyles as modal } from "../../../styles/shopModal.styles";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";
import { ModalShell } from "../ModalShell/ModalShell";

type Props = {
    open: boolean;
    item: ShopCatalogItemDto | null;
    isAdmin: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onOrderCreated?: () => void | Promise<void>;
};

export function ProductDetailsModal({
    open,
    item,
    isAdmin,
    onClose,
    onEdit,
    onDelete,
    onOrderCreated,
}: Props) {
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) {
            setSubmitting(false);
            setActionError(null);
            setCreatedOrderId(null);
        }
    }, [open, item?.id]);

    if (!open || !item) return null;

    const cardStyle = isAdmin ? modal.modalCard : modal.modalCardLight;
    const closeBtnStyle = isAdmin ? modal.modalCloseBtn : modal.modalCloseBtnLight;
    const buttonStyle = isAdmin ? modal.modalBtn : modal.modalBtnLight;
    const primaryButtonStyle = isAdmin
        ? { ...modal.modalBtn, ...modal.modalBtnPrimary }
        : { ...modal.modalBtnLight, ...modal.modalBtnPrimaryLight };
    const dangerButtonStyle = { ...buttonStyle, ...modal.modalBtnDanger };
    const categoryContext = getProductCategoryContext(item);

    const buy = async () => {
        if (submitting) return;
        setSubmitting(true);
        setActionError(null);
        setCreatedOrderId(null);
        try {
            const orderId = await createShopOrder({
                items: [{ productId: item.id, quantity: DEFAULT_SHOP_ORDER_QUANTITY }],
            });
            setCreatedOrderId(orderId);
            await onOrderCreated?.();
        } catch (err: unknown) {
            setActionError(extractShopErrorMessage(err, "Не удалось оформить покупку."));
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
                    {categoryContext ? (
                        <div style={s.detailsMeta}>{categoryContext}</div>
                    ) : null}
                    <p style={{ ...s.cardPrice, ...s.detailsPrice }}>
                        {formatMoney({ amount: item.priceAmount, currency: item.currency })}
                    </p>
                </div>

                {actionError ? <div style={modal.modalErrorText}>{actionError}</div> : null}

                {createdOrderId ? (
                    <div style={s.infoCard}>
                        <div style={s.modalSuccessText}>Заявка отправлена администратору.</div>
                        <div style={{ ...s.subtitle, marginTop: 8 }}>
                            Дальше ничего делать не нужно. Следить за статусом можно в блоке «Мои заявки» на главной странице магазина.
                        </div>
                        <div style={{ ...s.historyDate, marginTop: 8 }}>
                            Номер заявки: {createdOrderId.slice(0, 8)}
                        </div>
                    </div>
                ) : null}

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
                    ) : createdOrderId ? (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    navigate(`${SHOP_PATH}?tab=${SHOP_REQUESTS_TAB}`);
                                }}
                                style={primaryButtonStyle}
                            >
                                К моим заявкам
                            </button>
                            <button type="button" onClick={onClose} style={buttonStyle}>
                                Закрыть
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => void buy()}
                            style={primaryButtonStyle}
                            disabled={submitting}
                        >
                            {submitting ? "Отправляем..." : "Оставить заявку"}
                        </button>
                    )}
                </div>
            </div>
        </ModalShell>
    );
}
