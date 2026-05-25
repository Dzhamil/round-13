import type { ShopCatalogItemDto } from "../../../model/shop.types";
import { formatMoney } from "../../../model/money";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";

type Props = {
    item: ShopCatalogItemDto;
    onClick: () => void;
};

export function ShopItemCard({ item, onClick }: Props) {
    return (
        <button type="button" onClick={onClick} style={s.itemListCard}>
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
    );
}
