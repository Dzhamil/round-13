import type { ShopCatalogItemDto } from "../../../api/product.api";
import { formatMoney } from "../../../model/money";
import { getTrainingProductSummary } from "../../../model/trainingProductSemantics";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";

type Props = {
    item: ShopCatalogItemDto;
    onClick?: () => void;
    onBuy?: () => void;
    onDetails?: () => void;
};

export function ShopItemCard({ item, onClick, onBuy, onDetails }: Props) {
    const openDetails = onDetails ?? onClick;
    const buy = onBuy ?? openDetails;
    const trainingSummary = getTrainingProductSummary(item);

    return (
        <article style={s.itemListCard}>
            <button type="button" onClick={openDetails} style={s.itemListContentButton}>
                {item.imageDataUrl ? (
                    <img
                        src={item.imageDataUrl}
                        alt={item.title}
                        style={s.itemListImage}
                        loading="lazy"
                    />
                ) : (
                    <div style={s.itemListImage} />
                )}

                <div style={s.itemListBody}>
                    <div style={s.cardTitle}>{item.title}</div>
                    <p style={s.itemListDescription}>
                        {item.description?.trim() || "Описание отсутствует."}
                    </p>
                    {trainingSummary ? (
                        <div style={s.itemListMeta}>{trainingSummary}</div>
                    ) : null}
                    <div style={s.itemListPrice}>
                        {formatMoney({ amount: item.priceAmount, currency: item.currency })}
                    </div>
                </div>
            </button>

            <div style={s.itemListActions}>
                <button type="button" onClick={buy} style={s.itemListActionPrimary}>
                    Купить
                </button>
                <button type="button" onClick={openDetails} style={s.itemListActionSecondary}>
                    Подробнее
                </button>
            </div>
        </article>
    );
}
