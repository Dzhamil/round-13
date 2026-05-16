import { shopPageStyles as s } from "../../../styles/shopPage.styles";
import type { ShopCatalogItemDto } from "../../../api/product.api";
import { formatMoney } from "../../../model/money";

type Props = {
    item: ShopCatalogItemDto;
    submitting: boolean;
    actionError: string | null;
    createdOrderId: string | null;
    onBuy: () => void;
    onGoToRequests: () => void;
    onBackToShop: () => void;
};

export function ShopItemDetailsView({
    item,
    submitting,
    actionError,
    createdOrderId,
    onBuy,
    onGoToRequests,
    onBackToShop,
}: Props) {
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

            <p style={{ ...s.cardPrice, ...s.detailsPrice }}>
                {formatMoney({ amount: item.priceAmount, currency: item.currency })}
            </p>

            {actionError ? <div style={s.actionError}>{actionError}</div> : null}

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
