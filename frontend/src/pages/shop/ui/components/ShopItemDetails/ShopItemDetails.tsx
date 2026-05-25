import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { shopPageStyles as s } from "../../../styles/shopPage.styles";
import { SHOP_PATH, SHOP_REQUESTS_TAB } from "../../../model/shop.constants";
import { useCreateShopOrderRequest } from "../../../model/useCreateShopOrderRequest";
import { useShopItem } from "../../../model/useShopItem";
import { buildRequestedStartTime } from "../../../model/trainingRequest";

import { ShopItemDetailsView } from "./ShopItemDetailsView";

type Props = {
    code: string;
};

export function ShopItemDetails({ code }: Props) {
    const { item, loading, error, reload } = useShopItem(code);
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
        }
    };

    return (
        <ShopItemDetailsView
            item={item}
            submitting={submitting}
            actionError={actionError ?? validationError}
            createdOrderId={createdOrderId}
            requestedDate={requestedDate}
            requestedTime={requestedTime}
            createdRequestedStartTime={createdRequestedStartTime}
            onRequestedDateChange={setRequestedDate}
            onRequestedTimeChange={setRequestedTime}
            onBuy={() => void buy()}
            onGoToRequests={() => navigate(`${SHOP_PATH}?tab=${SHOP_REQUESTS_TAB}`)}
            onBackToShop={() => navigate(SHOP_PATH)}
        />
    );
}
