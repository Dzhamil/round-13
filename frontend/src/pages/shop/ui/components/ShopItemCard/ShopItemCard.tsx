import { formatMoney } from "../../../model/money";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";

type ShopItemCardItem = {
    id: string;
    title: string;
    description?: string | null;
    priceAmount: number;
    currency: string;
    imageDataUrl?: string | null;
};

type Props = {
    item: ShopItemCardItem;
    onClick?: () => void;
    onBuy?: () => void;
    onDetails?: () => void;
};

export function ShopItemCard({ item, onClick, onBuy, onDetails }: Props) {
    const openDetails = onDetails ?? onClick;
    const buy = onBuy ?? openDetails;

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
