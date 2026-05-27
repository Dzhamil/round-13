import type { ChangeEvent } from "react";

import type { ShopCatalogItemDto } from "../../../api/product.api";
import { formatMoney } from "../../../model/money";
import { getProductCategoryContext } from "../../../model/trainingProductSemantics";
import { formatRequestedStartTime } from "../../../model/trainingRequest";
import { shopModalStyles as modal } from "../../../styles/shopModal.styles";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";

type Props = {
    item: ShopCatalogItemDto;
    submitting: boolean;
    actionError: string | null;
    createdOrderId: string | null;
    requestedDate: string;
    requestedTime: string;
    createdRequestedStartTime: string | null;
    onRequestedDateChange: (value: string) => void;
    onRequestedTimeChange: (value: string) => void;
    onBuy: () => void;
    onGoToRequests: () => void;
    onBackToShop: () => void;
};

export function ShopItemDetailsView({
    item,
    submitting,
    actionError,
    createdOrderId,
    requestedDate,
    requestedTime,
    createdRequestedStartTime,
    onRequestedDateChange,
    onRequestedTimeChange,
    onBuy,
    onGoToRequests,
    onBackToShop,
}: Props) {
    const categoryContext = getProductCategoryContext(item);
    const isPersonalTraining = item.entitlementType === "PERSONAL_TRAININGS";

    return (
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
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                    onRequestedDateChange(event.target.value);
                                }}
                                style={{ ...modal.modalInput, marginBottom: 0 }}
                            />
                        </label>
                        <label style={s.trainingRequestField}>
                            <span style={modal.modalLabel}>Время</span>
                            <input
                                type="time"
                                value={requestedTime}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                    onRequestedTimeChange(event.target.value);
                                }}
                                style={{ ...modal.modalInput, marginBottom: 0 }}
                            />
                        </label>
                    </div>
                </div>
            ) : null}

            {actionError ? <div style={s.actionError}>{actionError}</div> : null}

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

            <div style={s.detailsActions}>
                {createdOrderId ? (
                    <>
                        <button type="button" onClick={onGoToRequests} style={s.detailsPrimaryButton}>
                            К моим заявкам
                        </button>
                        <button type="button" onClick={onBackToShop} style={s.detailsSecondaryButton}>
                            Назад в магазин
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={onBuy}
                            style={s.detailsPrimaryButton}
                            disabled={submitting}
                        >
                            {submitting ? "Отправляем..." : "Купить товар"}
                        </button>
                        <button type="button" onClick={onBackToShop} style={s.detailsSecondaryButton}>
                            Назад в магазин
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
