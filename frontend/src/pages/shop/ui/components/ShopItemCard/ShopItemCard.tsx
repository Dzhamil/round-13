import type { ShopCatalogItemDto } from "../../../model/shop.types";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";

type Props = {
    item: ShopCatalogItemDto;
    onClick: () => void;
};

export function ShopItemCard({ item, onClick }: Props) {
    return (
        <button type="button" onClick={onClick} style={s.card}>
            {item.imageDataUrl ? (
                <img
                    src={item.imageDataUrl}
                    alt={item.title}
                    style={s.cardImage}
                    loading="lazy"
                />
            ) : (
                <div style={s.cardImage} />
            )}

            <p style={s.cardTitle}>{item.title}</p>
            <p style={s.cardPrice}>{formatMoney(item.priceAmount, item.currency)}</p>
        </button>
    );
}

function formatMoney(amount: number, currency: string): string {
    // amount приходит в "копейках"
    const value = (amount / 100).toFixed(2);

    // Минимально достаточный формат без лишних библиотек
    if (currency === "RUB") return `${value} ₽`;
    if (currency === "USD") return `$${value}`;
    if (currency === "EUR") return `€${value}`;
    return `${value} ${currency}`;
}
