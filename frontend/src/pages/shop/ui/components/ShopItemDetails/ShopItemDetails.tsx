import { shopPageStyles as s } from "../../../styles/shopPage.styles";
import { useShopItem } from "../../../model/useShopItem";

import { ShopItemDetailsView } from "./ShopItemDetailsView";

type Props = {
    code: string;
};

export function ShopItemDetails({ code }: Props) {
    const { item, loading, error, reload } = useShopItem(code);

    if (loading) return <div>Загрузка товара…</div>;

    if (error) {
        return (
            <div>
                <p style={s.subtitle}>{error}</p>
                <button type="button" onClick={() => void reload()} style={s.backButton}>
                    Повторить
                </button>
            </div>
        );
    }

    if (!item) return null;

    return <ShopItemDetailsView item={item} />;
}
