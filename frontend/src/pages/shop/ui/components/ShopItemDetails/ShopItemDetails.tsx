import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { shopPageStyles as s } from "../../../styles/shopPage.styles";
import { SHOP_PATH, SHOP_REQUESTS_TAB } from "../../../model/shop.constants";
import { useCreateShopOrderRequest } from "../../../model/useCreateShopOrderRequest";
import { useShopItem } from "../../../model/useShopItem";

import { ShopItemDetailsView } from "./ShopItemDetailsView";

type Props = {
    code: string;
};

export function ShopItemDetails({ code }: Props) {
    const { item, loading, error, reload } = useShopItem(code);
    const { submitting, actionError, createdOrderId, createOrder, resetOrderState } =
        useCreateShopOrderRequest();
    const navigate = useNavigate();

    useEffect(() => {
        resetOrderState();
    }, [code, item?.id, resetOrderState]);

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

    return (
        <ShopItemDetailsView
            item={item}
            submitting={submitting}
            actionError={actionError}
            createdOrderId={createdOrderId}
            onBuy={() => void createOrder(item.id)}
            onGoToRequests={() => navigate(`${SHOP_PATH}?tab=${SHOP_REQUESTS_TAB}`)}
            onBackToShop={() => navigate(SHOP_PATH)}
        />
    );
}
