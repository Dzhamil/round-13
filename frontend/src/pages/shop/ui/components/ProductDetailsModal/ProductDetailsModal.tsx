import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ShopCatalogItemDto } from "../../../api/product.api";
import { SHOP_PATH, SHOP_REQUESTS_TAB } from "../../../model/shop.constants";
import { formatMoney } from "../../../model/money";
import { useCreateShopOrderRequest } from "../../../model/useCreateShopOrderRequest";
import { getProductCategoryContext } from "../../../model/trainingProductSemantics";
import { buildRequestedStartTime, formatRequestedStartTime } from "../../../model/trainingRequest";
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
    const { submitting, actionError, createdOrderId, createOrder, resetOrderState } =
        useCreateShopOrderRequest();
    const [requestedDate, setRequestedDate] = useState("");
    const [requestedTime, setRequestedTime] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [createdRequestedStartTime, setCreatedRequestedStartTime] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        resetOrderState();
        setRequestedDate("");
        setRequestedTime("");
        setValidationError(null);
        setCreatedRequestedStartTime(null);
    }, [open, item?.id, resetOrderState]);

    if (!open || !item) return null;

    const cardStyle = isAdmin ? modal.modalCard : modal.modalCardLight;
    const closeBtnStyle = isAdmin ? modal.modalCloseBtn : modal.modalCloseBtnLight;
    const buttonStyle = isAdmin ? modal.modalBtn : modal.modalBtnLight;
    const primaryButtonStyle = isAdmin
        ? { ...modal.modalBtn, ...modal.modalBtnPrimary }
        : { ...modal.modalBtnLight, ...modal.modalBtnPrimaryLight };
    const dangerButtonStyle = { ...buttonStyle, ...modal.modalBtnDanger };
    const categoryContext = getProductCategoryContext(item);
    const isPersonalTraining = item.entitlementType === "PERSONAL_TRAININGS";

    const buy = async () => {
        const requestedStartTime = isPersonalTraining
            ? buildRequestedStartTime(requestedDate, requestedTime)
            : null;
        setValidationError(null);
        setCreatedRequestedStartTime(null);
        if (isPersonalTraining && !requestedStartTime) {
            resetOrderState();
            setValidationError("Выберите желаемые дату и время тренировки.");
            return;
        }
        if (requestedStartTime && requestedStartTime.getTime() <= Date.now()) {
            resetOrderState();
            setValidationError("Выберите будущие дату и время тренировки.");
            return;
        }

        const orderId = await createOrder(
            item.id,
            requestedStartTime
                ? { trainingRequest: { requestedStartTime: requestedStartTime.toISOString() } }
                : undefined
        );
        if (orderId) {
            setCreatedRequestedStartTime(requestedStartTime?.toISOString() ?? null);
            await onOrderCreated?.();
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

                {isPersonalTraining && !createdOrderId ? (
                    <div style={s.trainingRequestBox}>
                        <div style={s.trainingRequestTitle}>Желаемое время занятия</div>
                        <div style={s.trainingRequestHint}>
                            Выберите желаемые дату и время. Администратор подтвердит возможность записи.
                        </div>
                        <div style={s.trainingRequestFields}>
                            <label style={s.trainingRequestField}>
                                <span style={modal.modalLabel}>Дата</span>
                                <input
                                    type="date"
                                    value={requestedDate}
                                    onChange={(event) => setRequestedDate(event.target.value)}
                                    style={{ ...modal.modalInput, marginBottom: 0 }}
                                />
                            </label>
                            <label style={s.trainingRequestField}>
                                <span style={modal.modalLabel}>Время</span>
                                <input
                                    type="time"
                                    value={requestedTime}
                                    onChange={(event) => setRequestedTime(event.target.value)}
                                    style={{ ...modal.modalInput, marginBottom: 0 }}
                                />
                            </label>
                        </div>
                    </div>
                ) : null}

                {actionError || validationError ? (
                    <div style={modal.modalErrorText}>{actionError ?? validationError}</div>
                ) : null}

                {createdOrderId ? (
                    <div style={s.infoCard}>
                        <div style={s.modalSuccessText}>Заявка отправлена администратору.</div>
                        <div style={{ ...s.subtitle, marginTop: 8 }}>
                            Дальше ничего делать не нужно. Следить за статусом можно в блоке «Мои заявки» на главной странице магазина.
                        </div>
                        {createdRequestedStartTime ? (
                            <div style={{ ...s.historyDate, marginTop: 8 }}>
                                Запрошенное время: {formatRequestedStartTime(createdRequestedStartTime)}
                            </div>
                        ) : null}
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
                            {submitting ? "Отправляем..." : "Купить товар"}
                        </button>
                    )}
                </div>
            </div>
        </ModalShell>
    );
}
