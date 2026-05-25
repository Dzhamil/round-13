import { shopPageStyles as s } from "../../../styles/shopPage.styles";
import type { ShopCatalogItemDto } from "../../../api/product.api";
import { formatMoney } from "../../../model/money";
import { getProductCategoryContext } from "../../../model/trainingProductSemantics";

type Props = {
    item: ShopCatalogItemDto;
};

export function ShopItemDetailsView({ item }: Props) {
    const categoryContext = getProductCategoryContext(item);

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

            <button type="button" style={s.card}>
                Купить (скоро)
            </button>
        </div>
    );
}
